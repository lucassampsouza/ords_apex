-- NOTE: THIS IS THE VALUE FOR PLUGIN FILE PREFIX #IMAGE_PREFIX#plugins/com.oracle.apex.d3.piechart/
FUNCTION RENDER (
    P_REGION IN APEX_PLUGIN.T_REGION,
    P_PLUGIN IN APEX_PLUGIN.T_PLUGIN,
    P_IS_PRINTER_FRIENDLY IN BOOLEAN
) RETURN APEX_PLUGIN.T_REGION_RENDER_RESULT IS
    -- Plugin attributes readable names
    C_WIDTH CONSTANT NUMBER := TO_NUMBER(APEX_PLUGIN_UTIL.REPLACE_SUBSTITUTIONS(P_REGION.ATTRIBUTE_05));
    C_INNER_RADIUS CONSTANT NUMBER := TO_NUMBER(APEX_PLUGIN_UTIL.REPLACE_SUBSTITUTIONS(P_REGION.ATTRIBUTE_06));
    C_SHOW_LABELS CONSTANT BOOLEAN := (INSTR(':' || P_REGION.ATTRIBUTE_07 || ':', ':LABELS:')  > 0);
    C_SHOW_TOOLTIP CONSTANT BOOLEAN := (INSTR(':' || P_REGION.ATTRIBUTE_07 || ':', ':TOOLTIP:') > 0);
    C_SHOW_LEGEND CONSTANT BOOLEAN := (INSTR(':' || P_REGION.ATTRIBUTE_07 || ':', ':LEGEND:') > 0);
    C_SHOW_PERCENTAGES CONSTANT BOOLEAN := (INSTR(':' || P_REGION.ATTRIBUTE_07 || ':', ':PERCENTAGES:')  > 0);
    C_COLOR_SCHEME CONSTANT VARCHAR2(255) := P_REGION.ATTRIBUTE_08;
    C_VALUE_FORMATTING CONSTANT VARCHAR2(255) := P_REGION.ATTRIBUTE_10;
    C_CHART_TYPE CONSTANT VARCHAR2(255) := P_REGION.ATTRIBUTE_11;
    C_LEGEND_POSITION VARCHAR2(255) := P_REGION.ATTRIBUTE_12;
    
    L_COLORS VARCHAR2(2000);
    L_OUTER_RADIUS_VALUE NUMBER;
    L_OUTER_RADIUS VARCHAR2(255);
    L_INNER_RADIUS VARCHAR2(255);

    -- Function constants
    C_D3_BASE_DIRECTORY CONSTANT VARCHAR2(255) := APEX_APPLICATION.G_IMAGE_PREFIX || 'libraries/d3/3.3.11/';
    --C_JQUERY_RESIZE_BASE_DIRECTORY CONSTANT VARCHAR2(255) := APEX_APPLICATION.G_IMAGE_PREFIX || 'libraries/jquery-elementresize/0.5/';
    C_PLUGIN_BASE CONSTANT VARCHAR2(255) := APEX_APPLICATION.G_IMAGE_PREFIX || 'plugins/com.oracle.apex.d3.piechart/';
    C_D3_ORACLE_BASE CONSTANT VARCHAR2(255) := APEX_APPLICATION.G_IMAGE_PREFIX || 'plugins/com.oracle.apex.d3/';
    C_D3_ARY_BASE CONSTANT VARCHAR2(255) := APEX_APPLICATION.G_IMAGE_PREFIX || 'plugins/com.oracle.apex.d3.ary/';
    C_D3_TOOLTIP_BASE CONSTANT VARCHAR2(255) := APEX_APPLICATION.G_IMAGE_PREFIX || 'plugins/com.oracle.apex.d3.tooltip/';
BEGIN
    -- Placeholder div for chart
    SYS.HTP.P(
        '<div><div id="' || APEX_ESCAPE.HTML_ATTRIBUTE(P_REGION.STATIC_ID || '_chart') || '" class="a-D3PieChart-container"></div></div>' 
    );
    
    -- JavaScript libraries
    /*APEX_JAVASCRIPT.ADD_LIBRARY(
        P_NAME => 'jquery.resize',
        P_DIRECTORY => C_JQUERY_RESIZE_BASE_DIRECTORY 
    );*/
    APEX_JAVASCRIPT.ADD_LIBRARY(
        P_NAME => 'd3.min',
        P_DIRECTORY => C_D3_BASE_DIRECTORY 
    );
    APEX_JAVASCRIPT.ADD_LIBRARY(
        P_NAME => 'd3.oracle',
        P_DIRECTORY => C_D3_ORACLE_BASE 
    );
    APEX_JAVASCRIPT.ADD_LIBRARY(
        P_NAME      => 'd3.oracle.tooltip',
        P_DIRECTORY => C_D3_TOOLTIP_BASE 
    );
    APEX_JAVASCRIPT.ADD_LIBRARY(
        P_NAME      => 'd3.oracle.ary',
        P_DIRECTORY => C_D3_ARY_BASE 
    );
    APEX_JAVASCRIPT.ADD_LIBRARY(
        P_NAME      => 'd3.oracle.piechart',
        P_DIRECTORY => C_PLUGIN_BASE
    );
    APEX_JAVASCRIPT.ADD_LIBRARY(
        P_NAME      => 'd3.oracle.piechart.labels',
        P_DIRECTORY => C_PLUGIN_BASE
    );
    APEX_JAVASCRIPT.ADD_LIBRARY(
        P_NAME => 'com.oracle.apex.d3.piechart',
        P_DIRECTORY => C_PLUGIN_BASE
    );
    
    -- Styles
    APEX_CSS.ADD_FILE (
        P_NAME => 'd3.oracle.tooltip',
        P_DIRECTORY => C_D3_TOOLTIP_BASE
    );
    APEX_CSS.ADD_FILE (
        P_NAME => 'd3.oracle.ary',
        P_DIRECTORY => C_D3_ARY_BASE
    );
    APEX_CSS.ADD_FILE (
        P_NAME => 'd3.oracle.piechart',
        P_DIRECTORY => C_PLUGIN_BASE
    );

    -- Color scheme
    -- Defaults to NULL
    L_COLORS := CASE C_COLOR_SCHEME
        WHEN 'MODERN' THEN
            '#FF3B30:#FF9500:#FFCC00:#4CD964:#34AADC:#007AFF:#5856D6:#FF2D55:#8E8E93:#C7C7CC'
        WHEN 'MODERN2' THEN
            '#1ABC9C:#2ECC71:#4AA3DF:#9B59B6:#3D566E:#F1C40F:#E67E22:#E74C3C'
        WHEN 'SOLAR' THEN
            '#B58900:#CB4B16:#DC322F:#D33682:#6C71C4:#268BD2:#2AA198:#859900'
        WHEN 'METRO' THEN
            '#E61400:#19A2DE:#319A31:#EF9608:#8CBE29:#A500FF:#00AAAD:#FF0094:#9C5100:#E671B5'
        WHEN 'CUSTOM' THEN
            P_REGION.ATTRIBUTE_09
    END;
    
    L_OUTER_RADIUS_VALUE := C_WIDTH / 2;
    IF  L_OUTER_RADIUS_VALUE > 0 AND L_OUTER_RADIUS_VALUE < 1 THEN
      L_OUTER_RADIUS := '0' || TO_CHAR(L_OUTER_RADIUS_VALUE);
    ELSE
      L_OUTER_RADIUS := TO_CHAR(L_OUTER_RADIUS_VALUE);
    END IF;
    
    IF C_CHART_TYPE = 'DONUT' THEN
        L_INNER_RADIUS := TO_CHAR(C_INNER_RADIUS);
    ELSE
        L_INNER_RADIUS := '0';
    END IF;

    -- Initialize the pie chart when the page has been rendered.
    -- apex_javascript.add_attribute are used to make sure that
    -- the values are properly escaped.   
    APEX_JAVASCRIPT.ADD_ONLOAD_CODE(
        P_CODE => 'com_oracle_apex_d3_pie(' ||
            APEX_JAVASCRIPT.ADD_VALUE(P_REGION.STATIC_ID) ||
            '{' ||
                APEX_JAVASCRIPT.ADD_ATTRIBUTE('chartRegionId',  P_REGION.STATIC_ID || '_chart') ||
                APEX_JAVASCRIPT.ADD_ATTRIBUTE('colors', L_COLORS) || 
                '"outerRadius":' || L_OUTER_RADIUS || ',' ||
                '"innerRadius":' || L_INNER_RADIUS || ',' ||
                APEX_JAVASCRIPT.ADD_ATTRIBUTE('showLabels', C_SHOW_LABELS) || 
                APEX_JAVASCRIPT.ADD_ATTRIBUTE('showLegend', C_SHOW_LEGEND) ||
                APEX_JAVASCRIPT.ADD_ATTRIBUTE('legendPosition', C_LEGEND_POSITION) ||
                APEX_JAVASCRIPT.ADD_ATTRIBUTE('showTooltip', C_SHOW_TOOLTIP) || 
                APEX_JAVASCRIPT.ADD_ATTRIBUTE('showPercentages', C_SHOW_PERCENTAGES) || 
                APEX_JAVASCRIPT.ADD_ATTRIBUTE('valueTemplate', C_VALUE_FORMATTING) || 
                APEX_JAVASCRIPT.ADD_ATTRIBUTE('transitions', TRUE) || 
                APEX_JAVASCRIPT.ADD_ATTRIBUTE('noDataFoundMessage', P_REGION.NO_DATA_FOUND_MESSAGE) || 
                APEX_JAVASCRIPT.ADD_ATTRIBUTE('pageItems', APEX_PLUGIN_UTIL.PAGE_ITEM_NAMES_TO_JQUERY(P_REGION.AJAX_ITEMS_TO_SUBMIT)) ||
                APEX_JAVASCRIPT.ADD_ATTRIBUTE('ajaxIdentifier', APEX_PLUGIN.GET_AJAX_IDENTIFIER, FALSE, FALSE) ||
            '});' 
    );
    
    RETURN NULL;
END RENDER;

FUNCTION AJAX (
     P_REGION IN APEX_PLUGIN.T_REGION,
     P_PLUGIN IN APEX_PLUGIN.T_PLUGIN
) RETURN APEX_PLUGIN.T_REGION_AJAX_RESULT IS
    -- It's better to have named variables instead of using the generic ones,
    -- makes the code more readable. We are using the same defaults for the
    -- required attributes as in the plug-in attribute configuration, because
    -- they can still be null. Keep them in sync!
    C_LABEL_COLUMN CONSTANT VARCHAR2(255) := P_REGION.ATTRIBUTE_01;
    C_VALUE_COLUMN CONSTANT VARCHAR2(255) := P_REGION.ATTRIBUTE_02;
    C_COLOR_COLUMN CONSTANT VARCHAR2(255) := P_REGION.ATTRIBUTE_03;
    
    C_LINK_TARGET CONSTANT VARCHAR2(255) := P_REGION.ATTRIBUTE_04;

    L_LABEL_COLUMN_NO PLS_INTEGER;
    L_VALUE_COLUMN_NO PLS_INTEGER;
    L_COLOR_COLUMN_NO PLS_INTEGER;
    
    L_COLUMN_VALUE_LIST APEX_PLUGIN_UTIL.T_COLUMN_VALUE_LIST2;
    
    L_LABEL VARCHAR2(4000);
    L_VALUE NUMBER;
    L_COLOR VARCHAR2(20);
    L_LINK VARCHAR2(4000);
BEGIN
    APEX_PLUGIN_UTIL.PRINT_JSON_HTTP_HEADER;
    
    L_COLUMN_VALUE_LIST := APEX_PLUGIN_UTIL.GET_DATA2(
        P_SQL_STATEMENT => P_REGION.SOURCE,
        P_MIN_COLUMNS => 2,
        P_MAX_COLUMNS => NULL,
        P_COMPONENT_NAME => P_REGION.NAME
    );
    
    -- Get the actual column# for faster access and also verify that the data type
    -- of the column matches with what we are looking for
    L_LABEL_COLUMN_NO := APEX_PLUGIN_UTIL.GET_COLUMN_NO(
        P_ATTRIBUTE_LABEL => 'Label Column',
        P_COLUMN_ALIAS => C_LABEL_COLUMN,
        P_COLUMN_VALUE_LIST => L_COLUMN_VALUE_LIST,
        P_IS_REQUIRED => TRUE,
        P_DATA_TYPE => APEX_PLUGIN_UTIL.C_DATA_TYPE_VARCHAR2 
    );                              
    L_VALUE_COLUMN_NO := APEX_PLUGIN_UTIL.GET_COLUMN_NO(
        P_ATTRIBUTE_LABEL=> 'Value Column',
        P_COLUMN_ALIAS => C_VALUE_COLUMN,
        P_COLUMN_VALUE_LIST => L_COLUMN_VALUE_LIST,
        P_IS_REQUIRED => TRUE,
        P_DATA_TYPE => APEX_PLUGIN_UTIL.C_DATA_TYPE_NUMBER
    );
    L_COLOR_COLUMN_NO := APEX_PLUGIN_UTIL.GET_COLUMN_NO(
        P_ATTRIBUTE_LABEL => 'Color Column',
        P_COLUMN_ALIAS => C_COLOR_COLUMN,
        P_COLUMN_VALUE_LIST => L_COLUMN_VALUE_LIST,
        P_IS_REQUIRED => FALSE,
        P_DATA_TYPE => APEX_PLUGIN_UTIL.C_DATA_TYPE_VARCHAR2
    );

    SYS.HTP.PRN('[');
    -- It's time to emit the selected rows
    FOR L_ROW_NUM IN 1 .. L_COLUMN_VALUE_LIST(1).VALUE_LIST.COUNT LOOP
        BEGIN
            APEX_PLUGIN_UTIL.SET_COMPONENT_VALUES(
                P_COLUMN_VALUE_LIST => L_COLUMN_VALUE_LIST,
                P_ROW_NUM => L_ROW_NUM
            );
            
            L_LABEL := APEX_PLUGIN_UTIL.ESCAPE(
                APEX_PLUGIN_UTIL.GET_VALUE_AS_VARCHAR2(
                    P_DATA_TYPE => L_COLUMN_VALUE_LIST(L_LABEL_COLUMN_NO).DATA_TYPE,
                    P_VALUE     => L_COLUMN_VALUE_LIST(L_LABEL_COLUMN_NO).VALUE_LIST(L_ROW_NUM)
                ),
                P_REGION.ESCAPE_OUTPUT
            );
            L_VALUE := L_COLUMN_VALUE_LIST(L_VALUE_COLUMN_NO).VALUE_LIST(L_ROW_NUM).NUMBER_VALUE;
            IF L_COLOR_COLUMN_NO IS NOT NULL THEN
                L_COLOR := APEX_PLUGIN_UTIL.ESCAPE(
                    APEX_PLUGIN_UTIL.GET_VALUE_AS_VARCHAR2(
                        P_DATA_TYPE => L_COLUMN_VALUE_LIST(L_COLOR_COLUMN_NO).DATA_TYPE,
                        P_VALUE     => L_COLUMN_VALUE_LIST(L_COLOR_COLUMN_NO).VALUE_LIST(L_ROW_NUM)
                    ),
                    TRUE
                );
            END IF;

            IF C_LINK_TARGET IS NOT NULL THEN
                L_LINK := WWV_FLOW_UTILITIES.PREPARE_URL(
                    APEX_PLUGIN_UTIL.REPLACE_SUBSTITUTIONS (
                        P_VALUE => C_LINK_TARGET,
                        P_ESCAPE => FALSE
                    )
                );
            END IF;
            
            -- write the data to our output buffer
            SYS.HTP.P(
                CASE WHEN L_ROW_NUM > 1 THEN ',' END ||
                '{' ||
                    APEX_JAVASCRIPT.ADD_ATTRIBUTE('label', L_LABEL) ||
                    APEX_JAVASCRIPT.ADD_ATTRIBUTE('color', L_COLOR) ||
                    APEX_JAVASCRIPT.ADD_ATTRIBUTE('link', L_LINK) ||
                    APEX_JAVASCRIPT.ADD_ATTRIBUTE('value', L_VALUE, FALSE, FALSE ) ||
                '}' );

            APEX_PLUGIN_UTIL.CLEAR_COMPONENT_VALUES;
        EXCEPTION WHEN OTHERS THEN
            APEX_PLUGIN_UTIL.CLEAR_COMPONENT_VALUES;
            RAISE;
        END;
    END LOOP;
    SYS.HTP.PRN(']');

    RETURN NULL;
END AJAX;