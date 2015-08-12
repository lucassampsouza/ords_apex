<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:fo="http://www.w3.org/1999/XSL/Format">
<xsl:output method="xml" indent="yes"/>
	<xsl:template match="/">
		<html>
			<head>
				<link rel="stylesheet" href="/i/xml/xml_pages.css" type="text/css"/>				
				<title>Flow: <xsl:value-of select="FLOWS/FLOW/@ID"/> - <xsl:value-of select="substring(FLOWS/FLOW/NAME,1,100)"/></title>
				<script type="text/javascript">
				<xsl:text disable-output-escaping="yes">
				<![CDATA[									
						function visOff(obj) {
						    obj.style.display = "none";
						  }
						
						function visOn(obj) {
						    obj.style.display = "block";
						  }
						
						function showhide(cbox,obj,j) {
							check1.checked=null;
							if (!cbox.checked){	
							      cbox.checked='checked';							      
								for( var i = 1; i < j; i++) {
									try{
										visOn(eval(obj + i));
									}
									catch(ex){};
								};	
								
								}
							else {
								//HTMLid.innerHTML = "+ Regions";								
								cbox.checked=null;								
								for( var i = 1; i < j; i++) {
									try{
										visOff(eval(obj + i));
									}
									catch(ex){};
								};								
								}
						}
												
						function all(HTMLid){
							if (!check1.checked ){
								check2.checked=null;								
								showhide(check2,'process',10);
																
								check3.checked=null;
								showhide(check3,'item',10);
								
								check4.checked=null;
								showhide(check4,'computation',10);
								
								check5.checked=null;
								showhide(check5,'navbar',10);
								
								check6.checked=null;
								showhide(check6,'tab',10);
								
								check7.checked=null;
								showhide(check7,'lov',10);

								check8.checked=null;
								showhide(check8,'tree',10);

								check9.checked=null;
								showhide(check9,'list',10);
								
								check10.checked=null;
								showhide(check10,'menu',10);

								check11.checked=null;
								showhide(check11,'shortcut',10);

								check12.checked=null;
								showhide(check12,'template',10);

								check13.checked=null;
								showhide(check13,'securityscheme',10);

								check14.checked=null;
								showhide(check14,'buildoption',10);

								check15.checked=null;
								showhide(check15,'pagesummary',10);
								
								check1.checked='checked';								
								}
							else{
								check2.checked='checked';					
								showhide(check2,'process',10);

								check3.checked='checked';
								showhide(check3,'item',10);
								
								check4.checked='checked';
								showhide(check4,'computation',10);
								
								check5.checked='checked';
								showhide(check5,'navbar',10);
			
								check6.checked='checked';
								showhide(check6,'tab',10);
								
								check7.checked='checked';
								showhide(check7,'lov',10);

								check8.checked='checked';
								showhide(check8,'tree',10);

								check9.checked='checked';
								showhide(check9,'list',10);
								
								check10.checked='checked';
								showhide(check10,'menu',10);

								check11.checked='checked';
								showhide(check11,'shortcut',10);

								check12.checked='checked';
								showhide(check12,'template',10);

								check13.checked='checked';
								showhide(check13,'securityscheme',10);

								check14.checked='checked';
								showhide(check14,'buildoption',10);

								check15.checked='checked';
								showhide(check15,'pagesummary',10);
																
								check1.checked=null;	
								}								
						}
							
							
						
				]]>
				</xsl:text>				
				</script>

			</head>
			<body>
			
			<table cellpadding="0" cellspacing="0" width="200" style="margin-bottom:25px; background-color:#eeeeee; border: 1px #888888 solid;">
				<tr>				
				<td nowrap="nowrap" class="navlinks"><input type="checkbox" disabled="disabled" id="check1" checked="checked"/><a href="javascript:all(allctrl);" id="allctrl"> All</a></td>					<td nowrap="nowrap" class="navlinks"><input type="checkbox" disabled="disabled" id="check2" checked="checked"/><a href="javascript:showhide(check2,'process',10)" id="processesctrl">Processes</a></td>
					<td nowrap="nowrap" class="navlinks"><input type="checkbox" disabled="disabled" id="check3" checked="checked"/><a href="javascript:showhide(check3,'item',10)" id="itemsctrl">Items</a></td>
					<td nowrap="nowrap" class="navlinks"><input type="checkbox" disabled="disabled" id="check4" checked="checked"/><a href="javascript:showhide(check4,'computation',10)" id="computationsctrl">Computations</a></td>
					<td nowrap="nowrap" class="navlinks"><input type="checkbox" disabled="disabled" id="check5" checked="checked"/><a href="javascript:showhide(check5,'navbar',10)" id="navbarsctrl"> NavBars</a></td>
					<td nowrap="nowrap" class="navlinks"><input type="checkbox" disabled="disabled" id="check6" checked="checked"/><a href="javascript:showhide(check6,'tab',10)" id="tabsctrl"> Tabs</a></td>
					<td nowrap="nowrap" class="navlinks"><input type="checkbox" disabled="disabled" id="check7" checked="checked"/><a href="javascript:showhide(check7,'lov',10)" id="lovsctrl"> LOVs</a></td>
					<td nowrap="nowrap" class="navlinks"><input type="checkbox" disabled="disabled" id="check8" checked="checked"/><a href="javascript:showhide(check8,'tree',10)" id="treesctrl"> Trees</a></td>
					<td nowrap="nowrap" class="navlinks"><input type="checkbox" disabled="disabled" id="check9" checked="checked"/><a href="javascript:showhide(check9,'list',10)" id="listsctrl"> Lists</a></td>
                                 <td nowrap="nowrap" class="navlinks"><input type="checkbox" disabled="disabled" id="check10" checked="checked"/><a href="javascript:showhide(check10,'menu',10)" id="shortcutsctrl"> Menus</a></td>
					<td nowrap="nowrap" class="navlinks"><input type="checkbox" disabled="disabled" id="check11" checked="checked"/><a href="javascript:showhide(check11,'shortcut',10)" id="shortcutsctrl"> Shortcuts</a></td>
					<td nowrap="nowrap" class="navlinks"><input type="checkbox" disabled="disabled" id="check12" checked="checked"/><a href="javascript:showhide(check12,'template',10)" id="templatesctrl"> Templates</a></td>
					<td nowrap="nowrap" class="navlinks"><input type="checkbox" disabled="disabled" id="check13" checked="checked"/><a href="javascript:showhide(check13,'securityscheme',10)" id="securityschemesctrl"> Security</a></td>
					<td nowrap="nowrap" class="navlinks"><input type="checkbox" disabled="disabled" id="check14" checked="checked"/><a href="javascript:showhide(check14,'buildoption',10)" id="buildoptionsctrl"> BuildOpt</a></td>
					<td nowrap="nowrap" class="navlinks"><input type="checkbox" disabled="disabled" id="check15" checked="checked"/><a href="javascript:showhide(check15,'pagesummary',10)" id="pagesummariesctrl">Summary</a></td>
				</tr>
			</table>

				
                           <xsl:for-each select="FLOWS/FLOW">
					<xsl:apply-templates select="."/>
					<!--<table cellpadding="0" cellspacing="0" width="100%" style="margin-top:25px; margin-bottom: 10px;">
						<tr><td class="sectionhead1">Flow Process</td></tr>
						<tr><td class="sectionhead2">&#160;</td></tr>
					</table>-->

                                <xsl:call-template name="PROCESS_SECTION"> 
                                </xsl:call-template>				
				     
				     <xsl:call-template name="ITEM_SECTION">                                                              
                                </xsl:call-template>
                                
                                <xsl:call-template name="COMPUTATION_SECTION">
                                </xsl:call-template>
				     
				     <xsl:call-template name="NAVBAR_SECTION">
				     </xsl:call-template>
				     
				     <xsl:call-template name="PARENT_TAB_SECTION">
				     </xsl:call-template>
				     
				     <xsl:call-template name="STANDARD_TAB_SECTION">
				     </xsl:call-template>
				     
				     <xsl:call-template name="APPLICATION_TAB_SECTION">
				     </xsl:call-template>

                               <xsl:call-template name="LOV_SECTION">
				     </xsl:call-template>
				     
				     <xsl:call-template name="TREE_SECTION">
				     </xsl:call-template>
				     				     
				    <xsl:call-template name="LIST_SECTION">
				     </xsl:call-template>
				     
				     <xsl:call-template name="MENU_SECTION">
				     </xsl:call-template>
				     
				     <xsl:call-template name="SHORTCUT_SECTION">
				     </xsl:call-template>
				     
				     <xsl:call-template name="PAGE_TEMPLATE_SECTION">
				     </xsl:call-template>
				     
				     <xsl:call-template name="REGION_TEMPLATE_SECTION">
				     </xsl:call-template>

                                <xsl:call-template name="REPORT_TEMPLATE_SECTION">
				     </xsl:call-template>

                                <xsl:call-template name="LIST_TEMPLATE_SECTION">
				     </xsl:call-template>

                                <xsl:call-template name="FIELD_TEMPLATE_SECTION">
				     </xsl:call-template>

                               <xsl:call-template name="POPUP_LOV_TEMPLATE_SECTION">
				     </xsl:call-template>

                                <xsl:call-template name="MENU_TEMPLATE_SECTION">
				     </xsl:call-template>

       			     <xsl:call-template name="SECURITY_SCHEME_SECTION">
				     </xsl:call-template>
				     
				     <xsl:call-template name="BUILD_OPTION_SECTION">
				     </xsl:call-template>

                                <xsl:call-template name="PAGE_SUMMARY_SECTION">
				     </xsl:call-template>
                             

				</xsl:for-each>
			</body>
		</html>
	</xsl:template>
	
<!-- TEMPLATE MATCH  TEMPLATE MATCH   TEMPLATE MATCH   TEMPLATE MATCH   TEMPLATE MATCH   TEMPLATE MATCH   TEMPLATE MATCH   TEMPLATE MATCH   TEMPLATE MATCH   TEMPLATE MATCH   -->
	
	<xsl:template match="FLOWS/FLOW">
		<table class="page" cellspacing="0" cellpadding="0">
			<tr>	<td class="pagetitletop">Flow: <xsl:value-of select="@ID"/> - <xsl:value-of select="NAME"/></td></tr>
			<tr><td class="pagetitlebottom">
				<table width="100%"> 				
				<xsl:call-template name="FLOW_DETAILS">
                          <xsl:with-param name="label">Alias:</xsl:with-param>
                          <xsl:with-param name="value"><xsl:value-of select="ALIAS"/></xsl:with-param>
                          </xsl:call-template>				 
				<xsl:call-template name="FLOW_DETAILS">
                          <xsl:with-param name="label">Home Link:</xsl:with-param>
                          <xsl:with-param name="value"><xsl:value-of select="HOME_LINK"/></xsl:with-param>
                          </xsl:call-template>			
				<xsl:call-template name="FLOW_DETAILS">
                          <xsl:with-param name="label">Activity Logging: </xsl:with-param>
                          <xsl:with-param name="value"><xsl:value-of select="WEBDB_LOGGING"/></xsl:with-param>
                          </xsl:call-template>				
				<xsl:call-template name="FLOW_DETAILS">
                          <xsl:with-param name="label">Image Prefix:</xsl:with-param>
                          <xsl:with-param name="value"><xsl:value-of select="FLOW_IMAGE_PREFIX"/></xsl:with-param>
                          </xsl:call-template>				
				<xsl:call-template name="FLOW_DETAILS">
                          <xsl:with-param name="label">Public URL Prefix:</xsl:with-param>
                          <xsl:with-param name="value"><xsl:value-of select="PUBLIC_URL_PREFIX"/></xsl:with-param>
                          </xsl:call-template>				
				<xsl:call-template name="FLOW_DETAILS">
                          <xsl:with-param name="label">Authenticated URL Prefix:</xsl:with-param>
                          <xsl:with-param name="value"><xsl:value-of select="DBAUTH_URL_PREFIX"/></xsl:with-param>
                          </xsl:call-template>
				<xsl:call-template name="FLOW_DETAILS">
                          <xsl:with-param name="label">Version: </xsl:with-param>
                          <xsl:with-param name="value"><xsl:value-of select="FLOW_VERSION"/></xsl:with-param>
                          </xsl:call-template>					
				<xsl:call-template name="FLOW_DETAILS">
                          <xsl:with-param name="label">Rejoin Existing Sessions::</xsl:with-param>
                          <xsl:with-param name="value"><xsl:value-of select="REJOIN_EXISTING_SESSIONS"/></xsl:with-param>
                          </xsl:call-template>				
				<xsl:call-template name="FLOW_DETAILS">
                          <xsl:with-param name="label">Authenitcation Method: </xsl:with-param>
                          <xsl:with-param name="value"><xsl:value-of select="AUTHENTICATION"/></xsl:with-param>
                          </xsl:call-template>				
				<xsl:call-template name="FLOW_DETAILS">
                          <xsl:with-param name="label">Owner:</xsl:with-param>
                          <xsl:with-param name="value"><xsl:value-of select="OWNER"/></xsl:with-param>
                          </xsl:call-template>				
				<xsl:call-template name="FLOW_DETAILS">
                          <xsl:with-param name="label">Login URL: </xsl:with-param>
                          <xsl:with-param name="value"><xsl:value-of select="LOGIN_URL"/></xsl:with-param>
                          </xsl:call-template>				
				<xsl:call-template name="FLOW_DETAILS">
                          <xsl:with-param name="label">Logout URL:</xsl:with-param>
                          <xsl:with-param name="value"><xsl:value-of select="LOGOUT_URL"/></xsl:with-param>
                          </xsl:call-template>				
				<xsl:call-template name="FLOW_DETAILS">
                          <xsl:with-param name="label">Public User (schema name):</xsl:with-param>
                          <xsl:with-param name="value"><xsl:value-of select="PUBLIC_USER"/></xsl:with-param>
                          </xsl:call-template>				
				<xsl:call-template name="FLOW_DETAILS">
                          <xsl:with-param name="label">Proxy Server: </xsl:with-param>
                          <xsl:with-param name="value"><xsl:value-of select="PROXY_SERVER"/></xsl:with-param>
                          </xsl:call-template>				                   
				<xsl:call-template name="FLOW_DETAILS">
                          <xsl:with-param name="label">Required Security Scheme: </xsl:with-param>
                          <xsl:with-param name="value"><xsl:value-of select="SECURITY_SCHEME"/></xsl:with-param>
                          </xsl:call-template>						
				<xsl:call-template name="FLOW_DETAILS">
                          <xsl:with-param name="label">Default Page Template: </xsl:with-param>
                          <xsl:with-param name="value"><xsl:value-of select="WEBDB_TEMPLATE"/></xsl:with-param>
                          </xsl:call-template>
				<xsl:call-template name="FLOW_DETAILS">
                          <xsl:with-param name="label">Print Mode Page Template: </xsl:with-param>
                          <xsl:with-param name="value"><xsl:value-of select="PRINTER_FRIENDLY_TEMPLATE"/></xsl:with-param>
                          </xsl:call-template>				
				<xsl:call-template name="FLOW_DETAILS">
                          <xsl:with-param name="label">Default Region Template:</xsl:with-param>
                          <xsl:with-param name="value"><xsl:value-of select="DEFAULT_REGION_TEMPLATE"/></xsl:with-param>
                          </xsl:call-template>				
				<xsl:call-template name="FLOW_DETAILS">
                          <xsl:with-param name="label">Error Page Template:</xsl:with-param>
                          <xsl:with-param name="value"><xsl:value-of select="ERROR_TEMPLATE"/></xsl:with-param>
                          </xsl:call-template>											
				<xsl:call-template name="FLOW_DETAILS">
                          <xsl:with-param name="label">Flow Primary Language: </xsl:with-param>
                          <xsl:with-param name="value"><xsl:value-of select="FLOW_LANGUAGE"/></xsl:with-param>
                          </xsl:call-template>				
				<xsl:call-template name="FLOW_DETAILS">
                          <xsl:with-param name="label">Flow Language Derived From: </xsl:with-param>
                          <xsl:with-param name="value"><xsl:value-of select="FLOW_LANGUAGE_DERIVED_FROM"/></xsl:with-param>
                          </xsl:call-template>
                          <xsl:call-template name="FLOW_DETAILS">
                          <xsl:with-param name="label">charset: </xsl:with-param>
                          <xsl:with-param name="value"><xsl:value-of select="CHARSET"/></xsl:with-param>
                          </xsl:call-template>                      
                          <xsl:call-template name="FLOW_DETAILS">
                          <xsl:with-param name="label">Status:</xsl:with-param>
                          <xsl:with-param name="value"><xsl:value-of select="FLOW_STATUS"/></xsl:with-param>
                          </xsl:call-template>                          
                          <xsl:call-template name="FLOW_DETAILS">
                          <xsl:with-param name="label">Build Status:</xsl:with-param>
                          <xsl:with-param name="value"><xsl:value-of select="BUILD_STATUS"/></xsl:with-param>
                          </xsl:call-template>                         
                          <xsl:call-template name="FLOW_DETAILS">
                          <xsl:with-param name="label">Unavailable Text:</xsl:with-param>
                          <xsl:with-param name="value"><xsl:value-of select="FLOW_UNAVAILABLE_TEXT"/></xsl:with-param>
                          </xsl:call-template>                                                   
                          <xsl:call-template name="FLOW_DETAILS">
                          <xsl:with-param name="label">Restrict To comma separated User List:</xsl:with-param>
                          <xsl:with-param name="value"><xsl:value-of select="RESTRICT_TO_USER_LIST"/></xsl:with-param>
                          </xsl:call-template>
                          <xsl:call-template name="FLOW_DETAILS">
                          <xsl:with-param name="label">Global Notifications:</xsl:with-param>
                          <xsl:with-param name="value"><xsl:value-of select="GLOBAL_NOTIFICATION"/></xsl:with-param>
                          </xsl:call-template>
                          <xsl:call-template name="FLOW_DETAILS">
                          <xsl:with-param name="label">Substitution String 01:</xsl:with-param>
                          <xsl:with-param name="value"><xsl:value-of select="SUBSTITUTION_STRING_01"/></xsl:with-param>
                          </xsl:call-template>
                          <xsl:call-template name="FLOW_DETAILS">
                          <xsl:with-param name="label">Substitution Value 01:</xsl:with-param>
                          <xsl:with-param name="value"><xsl:value-of select="SUBSTITUTION_VALUE_01"/></xsl:with-param>
                          </xsl:call-template>
                          <xsl:call-template name="FLOW_DETAILS">
                          <xsl:with-param name="label">Substitution String 02:</xsl:with-param>
                          <xsl:with-param name="value"><xsl:value-of select="SUBSTITUTION_STRING_02"/></xsl:with-param>
                          </xsl:call-template>
                          <xsl:call-template name="FLOW_DETAILS">
                          <xsl:with-param name="label">Substitution Value 02:</xsl:with-param>
                          <xsl:with-param name="value"><xsl:value-of select="SUBSTITUTION_VALUE_02"/></xsl:with-param>
                          </xsl:call-template>
                          <xsl:call-template name="FLOW_DETAILS">
                          <xsl:with-param name="label">Substitution String 03:</xsl:with-param>
                          <xsl:with-param name="value"><xsl:value-of select="SUBSTITUTION_STRING_03"/></xsl:with-param>
                          </xsl:call-template>
                          <xsl:call-template name="FLOW_DETAILS">
                          <xsl:with-param name="label">Substitution Value 03:</xsl:with-param>
                          <xsl:with-param name="value"><xsl:value-of select="SUBSTITUTION_VALUE_03"/></xsl:with-param>
                          </xsl:call-template>
                          <xsl:call-template name="FLOW_DETAILS">
                          <xsl:with-param name="label">Substitution String 04:</xsl:with-param>
                          <xsl:with-param name="value"><xsl:value-of select="SUBSTITUTION_STRING_04"/></xsl:with-param>
                          </xsl:call-template>
                          <xsl:call-template name="FLOW_DETAILS">
                          <xsl:with-param name="label">Substitution Value 04:</xsl:with-param>
                          <xsl:with-param name="value"><xsl:value-of select="SUBSTITUTION_VALUE_04"/></xsl:with-param>
                          </xsl:call-template>
                          <xsl:call-template name="FLOW_DETAILS">
                          <xsl:with-param name="label">Substitution String 05:</xsl:with-param>
                          <xsl:with-param name="value"><xsl:value-of select="SUBSTITUTION_STRING_05"/></xsl:with-param>
                          </xsl:call-template>
                          <xsl:call-template name="FLOW_DETAILS">
                          <xsl:with-param name="label">Substitution Value 05:</xsl:with-param>
                          <xsl:with-param name="value"><xsl:value-of select="SUBSTITUTION_VALUE_05"/></xsl:with-param>
                          </xsl:call-template>
                          <xsl:call-template name="FLOW_DETAILS">
                          <xsl:with-param name="label">Substitution String 06:</xsl:with-param>
                          <xsl:with-param name="value"><xsl:value-of select="SUBSTITUTION_STRING_06"/></xsl:with-param>
                          </xsl:call-template>
                          <xsl:call-template name="FLOW_DETAILS">
                          <xsl:with-param name="label">Substitution Value 06:</xsl:with-param>
                          <xsl:with-param name="value"><xsl:value-of select="SUBSTITUTION_VALUE_06"/></xsl:with-param>
                          </xsl:call-template>
                          <xsl:call-template name="FLOW_DETAILS">
                          <xsl:with-param name="label">Substitution String 07:</xsl:with-param>
                          <xsl:with-param name="value"><xsl:value-of select="SUBSTITUTION_STRING_07"/></xsl:with-param>
                          </xsl:call-template>
                          <xsl:call-template name="FLOW_DETAILS">
                          <xsl:with-param name="label">Substitution Value 07:</xsl:with-param>
                          <xsl:with-param name="value"><xsl:value-of select="SUBSTITUTION_VALUE_07"/></xsl:with-param>
                          </xsl:call-template>
                          <xsl:call-template name="FLOW_DETAILS">
                          <xsl:with-param name="label">Substitution String 08</xsl:with-param>
                          <xsl:with-param name="value"><xsl:value-of select="SUBSTITUTION_STRING_08"/></xsl:with-param>                          
                          </xsl:call-template>
                          <xsl:call-template name="FLOW_DETAILS">
                          <xsl:with-param name="label">Substitution Value 08</xsl:with-param>
                          <xsl:with-param name="value"><xsl:value-of select="SUBSTITUTION_VALUE_08"/></xsl:with-param>
                          </xsl:call-template>
                          <xsl:call-template name="FLOW_DETAILS">
                          <xsl:with-param name="label">VPD:</xsl:with-param>
                          <xsl:with-param name="value"><xsl:value-of select="VPD"/></xsl:with-param>                          
                          </xsl:call-template>
                          <xsl:call-template name="FLOW_DETAILS">
                          <xsl:with-param name="label">Custom Authentication Process:</xsl:with-param>
                          <xsl:with-param name="value"><xsl:value-of select="CUSTOM_AUTHENTICATION_PROCESS"/></xsl:with-param>                          
                          </xsl:call-template>
                          <xsl:call-template name="FLOW_DETAILS">
                          <xsl:with-param name="label">Custom Authentication Page:</xsl:with-param>
                          <xsl:with-param name="value"><xsl:value-of select="CUSTOM_AUTHENTICATION_PAGE"/></xsl:with-param>                          
                          </xsl:call-template>
                          <xsl:call-template name="FLOW_DETAILS">
                          <xsl:with-param name="label">Custom Authentication URL:</xsl:with-param>
                          <xsl:with-param name="value"><xsl:value-of select="CUSTOM_AUTH_LOGIN_URL"/></xsl:with-param>                          
                          </xsl:call-template>
                          <xsl:call-template name="FLOW_DETAILS">
                          <xsl:with-param name="label">Last Updated:</xsl:with-param>
                          <xsl:with-param name="value"><xsl:value-of select="LAST_UPDATED_BY"/> - <xsl:value-of select="LAST_UPDATED_ON"/></xsl:with-param>                                               
                          </xsl:call-template>
                                                  
                           <xsl:element name="div">
	                    <xsl:attribute name="id">flowcomment1</xsl:attribute>
                          <xsl:for-each select="FLOW_COMMENTS"> 
		             <xsl:apply-templates select="FLOW_COMMENT"/>
				</xsl:for-each>	
				</xsl:element>

                          </table>                   		
				</td></tr>
		</table>
	</xsl:template>	
	
	<xsl:template match="FLOW_COMMENT">		
		<table class="itemouter" width="100%" cellpadding="0" cellspacing="0">
			<tr><td class="itmeoutertop">&#160;</td><td width="99%">&#160;</td></tr>
			<tr><td colspan="2" align="left">
			
				<table width="100%" cellpadding="0" cellspacing="0">  
				<xsl:if test="string-length(BANNER) &gt; 1">
			      <tr><td class="subtitle1" nowrap="nowrap"  valign="top">Comments:</td></tr>
			      <tr><td class="subtitle2" nowrap="nowrap"><xsl:value-of  disable-output-escaping="yes" select="BANNER"/></td></tr>			      
		             </xsl:if>                  		     	
	                   </table>	                
	                   
			</td></tr>
			<tr><td class="itmeouterbottom">&#160;</td><td width="99%">&#160;</td></tr>
		</table>		
	</xsl:template>    

	
	<xsl:template match="PROCESS">		
		<table class="itemouter" width="100%" cellpadding="0" cellspacing="0">
			<tr><td class="itmeoutertop">&#160;</td><td width="99%">&#160;</td></tr>
			<tr><td colspan="2" align="left">
			
				<table width="100%" cellpadding="0" cellspacing="0">                    		
                    		<xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Sequence:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of select="PROCESS_SEQUENCE"/></xsl:with-param>                          
                                 </xsl:call-template>                    		
                    		<xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Process Point:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="PROCESS_POINT"/></xsl:with-param>                          
                                 </xsl:call-template>					
					<xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Name:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="@NAME"/></xsl:with-param>                          
                                 </xsl:call-template>					
					<xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Type:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="PROCESS_TYPE"/></xsl:with-param>                          
                                 </xsl:call-template>	
                                 <xsl:call-template name="ITEM_CODE">
                                 <xsl:with-param name="label">Process Text:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of disable-output-escaping="yes"  select="PROCESS_SQL_CLOB"/></xsl:with-param>                          
                                 </xsl:call-template>					
					<xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Process Error Message:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="PROCESS_ERROR_MESSAGE"/></xsl:with-param>                          
                                 </xsl:call-template>					
					<xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Security Scheme:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="SECURITY_SCHEME"/></xsl:with-param>                          
                                 </xsl:call-template>					
					<xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Process When Type:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="PROCESS_WHEN_TYPE"/></xsl:with-param>                          
                                 </xsl:call-template>					
					<xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Process When:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="PROCESS_WHEN"/></xsl:with-param>                          
                                 </xsl:call-template>					
					<xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Build Option:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="REQUIRED_PATCH"/></xsl:with-param>                          
                                 </xsl:call-template>	
                                 <xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Process Comment:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="PROCESS_COMMENT"/></xsl:with-param>                          
                                 </xsl:call-template>
                                 <xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Last Updated:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of select="LAST_UPDATED_BY"/> - <xsl:value-of select="LAST_UPDATED_ON"/></xsl:with-param>                                               
                                 </xsl:call-template>
				</table>
				
			</td></tr>
			<tr><td class="itmeouterbottom">&#160;</td><td width="99%">&#160;</td></tr>
		</table>		
	</xsl:template>    
	
	
       <xsl:template match="ITEM">             		
		<table class="itemouter" width="100%" cellpadding="0" cellspacing="0">
			<tr><td class="itmeoutertop">&#160;</td><td width="99%">&#160;</td></tr>
			<tr><td colspan="2" align="left">			      		
				<table width="100%" cellpadding="0" cellspacing="0">                    		
                    		<xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Name:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="@NAME"/></xsl:with-param>                          
                                 </xsl:call-template>                    		
                    		<xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Name Length:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="NAME_LENGTH"/></xsl:with-param>                          
                                 </xsl:call-template>																		
                                 <xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Build Option:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="REQUIRED_PATCH"/></xsl:with-param>                          
                                 </xsl:call-template>					                               				
					<xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Item Comment:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="ITEM_COMMENT"/></xsl:with-param>                          
                                 </xsl:call-template>
                                  <xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Last Updated:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of select="LAST_UPDATED_BY"/> - <xsl:value-of select="LAST_UPDATED_ON"/></xsl:with-param>                                               
                                 </xsl:call-template>
	                   </table>			
			</td></tr>
			<tr><td class="itmeouterbottom">&#160;</td><td width="99%">&#160;</td></tr>
		</table>			
	 </xsl:template>
	 
	 
	 <xsl:template match="COMPUTATION">		
		<table class="itemouter" width="100%" cellpadding="0" cellspacing="0">
			<tr><td class="itmeoutertop">&#160;</td><td width="99%">&#160;</td></tr>
			<tr><td colspan="2" align="left">
			
				<table width="100%" cellpadding="0" cellspacing="0">                    		
                    		<xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Sequence:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="COMPUTATION_SEQUENCE"/></xsl:with-param>                          
                                 </xsl:call-template>                    					     
                    		<xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Computation Item:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="COMPUTATION_ITEM"/></xsl:with-param>                          
                                 </xsl:call-template>									
					<xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Computation Point:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="COMPUTATION_POINT"/></xsl:with-param>                          
                                 </xsl:call-template>									
					<xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Item Type:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="COMPUTATION_ITEM_TYPE"/></xsl:with-param>                          
                                 </xsl:call-template>					
					<xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Computation Type:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="COMPUTATION_TYPE"/></xsl:with-param>                          
                                 </xsl:call-template>					
					<xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Computation Processed:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="COMPUTATION_PROCESSED"/></xsl:with-param>                          
                                 </xsl:call-template>	
                                 <xsl:call-template name="ITEM_CODE">
                                 <xsl:with-param name="label">Computation:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  disable-output-escaping="yes"  select="COMPUTATION"/></xsl:with-param>                          
                                 </xsl:call-template>					
					<xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Computation Error Message:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="COMPUTATION_ERROR_MESSAGE"/></xsl:with-param>                          
                                 </xsl:call-template>					
					<xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Security Scheme:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="SECURITY_SCHEME"/></xsl:with-param>                          
                                 </xsl:call-template>	
                                 <xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Compute When Type:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="COMPUTE_WHEN_TYPE"/></xsl:with-param>                          
                                 </xsl:call-template>					
					<xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Expression 1:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="COMPUTE_WHEN"/></xsl:with-param>                          
                                 </xsl:call-template>	
					<xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Expression 2:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="COMPUTE_WHEN_TEXT"/></xsl:with-param>                          
                                 </xsl:call-template>					
					<xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Build Option:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="REQUIRED_PATCH"/></xsl:with-param>                          
                                 </xsl:call-template>																
					<xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Computation Comment:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="COMPUTATION_COMMENT"/></xsl:with-param>                          
                                 </xsl:call-template>
                                <xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Last Updated:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of select="LAST_UPDATED_BY"/> - <xsl:value-of select="LAST_UPDATED_ON"/></xsl:with-param>                                               
                                 </xsl:call-template>

	                   </table>
				
			</td></tr>
			<tr><td class="itmeouterbottom">&#160;</td><td width="99%">&#160;</td></tr>
		</table>		
	 </xsl:template>
	 
	 
	 <xsl:template match="NAVBAR">		
		<table class="itemouter" width="100%" cellpadding="0" cellspacing="0">
			<tr><td class="itmeoutertop">&#160;</td><td width="99%">&#160;</td></tr>
			<tr><td colspan="2" align="left">
			
				<table width="100%" cellpadding="0" cellspacing="0">                    		
                    		<xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Sequence:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="ICON_SEQUENCE"/></xsl:with-param>                          
                                 </xsl:call-template>   
                                 <xsl:call-template name="ITEM_DETAILS2">
                                 <xsl:with-param name="label">Subscription:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="SUBSCRIPTION"/></xsl:with-param>                          
                                 </xsl:call-template>                   				     
                    		<xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Begins On New Line:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="BEGINS_ON_NEW_LINE"/></xsl:with-param>                          
                                 </xsl:call-template>									
					<xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Cell ColSpan:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="CELL_COLSPAN"/></xsl:with-param>                          
                                 </xsl:call-template>									
					<xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Image:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="ICON_IMAGE"/></xsl:with-param>                          
                                 </xsl:call-template>					
					<xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Image 2:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="ICON_IMAGE2"/></xsl:with-param>                          
                                 </xsl:call-template>					
					<xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Image 3:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="ICON_IMAGE3"/></xsl:with-param>                          
                                 </xsl:call-template>					
					<xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Icon Subtext:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="ICON_SUBTEXT"/></xsl:with-param>                          
                                 </xsl:call-template>					
					<xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Icon Subtext 2:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="ICON_SUBTEXT2"/></xsl:with-param>                          
                                 </xsl:call-template>					
					<xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Icon Subtext 3:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="ICON_SUBTEXT3"/></xsl:with-param>                          
                                 </xsl:call-template>					
					<xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Icon Image Alt:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="ICON_IMAGE_ALT"/></xsl:with-param>                          
                                 </xsl:call-template>					
					<xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Image Height:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="ICON_HEIGHT"/></xsl:with-param>                          
                                 </xsl:call-template>					
					<xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Width:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="ICON_WIDTH"/></xsl:with-param>                          
                                 </xsl:call-template>					
					<xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Image Height2:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="ICON_HEIGHT2"/></xsl:with-param>                          
                                 </xsl:call-template>					
					<xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Width2:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="ICON_WIDTH2"/></xsl:with-param>                          
                                 </xsl:call-template>                                 
                                 <xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Image Height3:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="ICON_HEIGHT3"/></xsl:with-param>                          
                                 </xsl:call-template>					
					<xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Width3:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="ICON_WIDTH3"/></xsl:with-param>                          
                                 </xsl:call-template>                               
                                 <xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Icon Target:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="ICON_TARGET"/></xsl:with-param>                          
                                 </xsl:call-template>                                 
                                 <xsl:call-template name="ITEM_CODE">
                                 <xsl:with-param name="label">OnClick Javascript:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  disable-output-escaping="yes" select="ONCLICK"/></xsl:with-param>                          
                                 </xsl:call-template>                                
                                 <xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Security Scheme:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="SECURITY_SCHEME"/></xsl:with-param>                          
                                 </xsl:call-template>     
                                  <xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Display Condition Type:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="ICON_BAR_DISP_COND_TYPE"/></xsl:with-param>                          
                                 </xsl:call-template>                                          
                                 <xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Expression 1:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="ICON_BAR_DISP_COND"/></xsl:with-param>                          
                                 </xsl:call-template>      
                                 <xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Expression 2:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="ICON_BAR_FLOW_COND_INSTR"/></xsl:with-param>                          
                                 </xsl:call-template>                               
                                 <xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Build Option:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="REQUIRED_PATCH"/></xsl:with-param>                          
                                 </xsl:call-template>																
					<xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">NavBar Comment:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="ICON_BAR_COMMENT"/></xsl:with-param>                          
                                 </xsl:call-template>
                                 <xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Last Updated:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of select="LAST_UPDATED_BY"/> - <xsl:value-of select="LAST_UPDATED_ON"/></xsl:with-param>                                               
                                 </xsl:call-template>

	                   </table>
				
			</td></tr>
			<tr><td class="itmeouterbottom">&#160;</td><td width="99%">&#160;</td></tr>
		</table>		
	 </xsl:template>


      <xsl:template match="PARENT_TAB">
		
		<table class="itemouter" width="100%" cellpadding="0" cellspacing="0">
			<tr><td class="itmeoutertop">&#160;</td><td width="99%">&#160;</td></tr>
			<tr><td colspan="2" align="left">
			
				<table width="100%" cellpadding="0" cellspacing="0">                    		
                    		<xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Name:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="@NAME"/></xsl:with-param>                          
                                 </xsl:call-template>                    					     
                    		<xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Parent Tab Set:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="TAB_SET"/></xsl:with-param>                          
                                 </xsl:call-template>									
					<xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Sequence:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="TAB_SEQUENCE"/></xsl:with-param>                          
                                 </xsl:call-template>								
					<xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Current on Standard TabSet:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="CURRENT_ON_TABSET"/></xsl:with-param>                          
                                 </xsl:call-template>					
					<xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Label:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="TAB_TEXT"/></xsl:with-param>                          
                                 </xsl:call-template>					
					<xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Target:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="TAB_TARGET"/></xsl:with-param>                          
                                 </xsl:call-template>					
					<xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Image:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="TAB_IMAGE"/></xsl:with-param>                          
                                 </xsl:call-template>					
					<xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Non Current Image:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="TAB_NON_CURRENT_IMAGE"/></xsl:with-param>                          
                                 </xsl:call-template>					
					<xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Image Attributes:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="TAB_IMAGE_ATTRIBUTES"/></xsl:with-param>                          
                                 </xsl:call-template>									
					<xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Security Scheme:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="SECURITY_SCHEME"/></xsl:with-param>                          
                                 </xsl:call-template>
                                 <xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Display Condition:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="DISPLAY_CONDITION_TYPE"/></xsl:with-param>                          
                                 </xsl:call-template>						
					<xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Expression 1:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="DISPLAY_CONDITION"/></xsl:with-param>                          
                                 </xsl:call-template>
                                 <xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Expression 2:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="DISPLAY_CONDITION2"/></xsl:with-param>                          
                                 </xsl:call-template>				
					<xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Build Option:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="REQUIRED_PATCH"/></xsl:with-param>                          
                                 </xsl:call-template>															
					<xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Parent Tab Comment:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="TAB_COMMENT"/></xsl:with-param>                          
                                  </xsl:call-template>
                                 <xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Last Updated:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of select="LAST_UPDATED_BY"/> - <xsl:value-of select="LAST_UPDATED_ON"/></xsl:with-param>                                               
                                 </xsl:call-template>
                             </table>
				
			</td></tr>
			<tr><td class="itmeouterbottom">&#160;</td><td width="99%">&#160;</td></tr>
		</table>
	 </xsl:template>


        <xsl:template match="STANDARD_TAB">
		
		<table class="itemouter" width="100%" cellpadding="0" cellspacing="0">
			<tr><td class="itmeoutertop">&#160;</td><td width="99%">&#160;</td></tr>
			<tr><td colspan="2" align="left">
			
				<table width="100%" cellpadding="0" cellspacing="0">                    		
                    		<xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Tab Name:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="@NAME"/></xsl:with-param>                          
                                  </xsl:call-template>                    					     
                    		<xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Standard Tab Set:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="TAB_SET"/></xsl:with-param>                          
                                  </xsl:call-template>										
					<xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Sequence:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="TAB_SEQUENCE"/></xsl:with-param>                          
                                  </xsl:call-template>					
					<xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Image:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="TAB_IMAGE"/></xsl:with-param>                          
                                  </xsl:call-template>				
					<xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Non Current Image:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="TAB_NON_CURRENT_IMAGE"/></xsl:with-param>                          
                                  </xsl:call-template>					
					<xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Image Attributes:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="TAB_IMAGE_ATTRIBUTES"/></xsl:with-param>                          
                                  </xsl:call-template>				
					<xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Parent TabSet:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="TAB_PARENT_TABSET"/></xsl:with-param>                          
                                  </xsl:call-template>					
					<xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Tab Label:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="TAB_TEXT"/></xsl:with-param>                          
                                  </xsl:call-template>					
					<xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Tab Page:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="TAB_STEP"/></xsl:with-param>                          
                                  </xsl:call-template>                                
                                 <xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Tab Also Current for Pages:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="TAB_ALSO_CURRENT_FOR_PAGES"/></xsl:with-param>                          
                                  </xsl:call-template>                                 				
                                 <xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Security Scheme:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="SECURITY_SCHEME"/></xsl:with-param>                          
                                  </xsl:call-template>						
					<xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Condition Type:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="DISPLAY_CONDITION_TYPE"/></xsl:with-param>                          
                                  </xsl:call-template>					
					<xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Expression 1:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="TAB_PLSQL_CONDITION"/></xsl:with-param>                          
                                  </xsl:call-template>									
					<xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Expression 2:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="TAB_DISP_COND_TEXT"/></xsl:with-param>                          
                                  </xsl:call-template>									
					<xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Build Option:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="REQUIRED_PATCH"/></xsl:with-param>                          
                                  </xsl:call-template>																	
					<xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Standard Tab Comment:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="TAB_COMMENT"/></xsl:with-param>                          
                                  </xsl:call-template>
                                 <xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Last Updated:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of select="LAST_UPDATED_BY"/> - <xsl:value-of select="LAST_UPDATED_ON"/></xsl:with-param>                                               
                                 </xsl:call-template>
  				 </table>
				
			</td></tr>
			<tr><td class="itmeouterbottom">&#160;</td><td width="99%">&#160;</td></tr>
		</table>
	 </xsl:template>
	 
	 
	 
	 <xsl:template match="APPLICATION_TAB">
		
		<table class="itemouter" width="100%" cellpadding="0" cellspacing="0">
			<tr><td class="itmeoutertop">&#160;</td><td width="99%">&#160;</td></tr>
			<tr><td colspan="2" align="left">
			
				<table width="100%" cellpadding="0" cellspacing="0">                    		
                    		<xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Name:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="@NAME"/></xsl:with-param>                          
                                  </xsl:call-template>                    					                         											
					<xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Sequence:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="TAB_SEQUENCE"/></xsl:with-param>                          
                                  </xsl:call-template>					
					<xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Target:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="TAB_TARGET"/></xsl:with-param>                          
                                  </xsl:call-template>				
					<xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Tab Label:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="TAB_TEXT"/></xsl:with-param>                          
                                  </xsl:call-template>					
					<xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Condition Type:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="DISPLAY_CONDITION_TYPE"/></xsl:with-param>                          
                                  </xsl:call-template>					
					<xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Expression 1:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="TAB_CONDITION"/></xsl:with-param>                          
                                  </xsl:call-template>			
                                  <xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Expression 2:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="TAB_DISP_COND_TEXT"/></xsl:with-param>                          
                                  </xsl:call-template>					
					<xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Tab Flow:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="TAB_CURRENT_FLOW"/></xsl:with-param>                          
                                  </xsl:call-template>					
					<xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Tab Current Page Low:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="TAB_CURRENT_PAGE_LOW"/></xsl:with-param>                          
                                  </xsl:call-template>					
					<xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Tab Current Page High:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="TAB_CURRENT_PAGE_HIGH"/></xsl:with-param>                          
                                  </xsl:call-template>   			                                 										
                                  <xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Comment:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="TAB_COMMENT"/></xsl:with-param>                          
                                  </xsl:call-template>   
                                 <xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Last Updated:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of select="LAST_UPDATED_BY"/> - <xsl:value-of select="LAST_UPDATED_ON"/></xsl:with-param>                                               
                                 </xsl:call-template>													
  				 </table>
				
			</td></tr>
			<tr><td class="itmeouterbottom">&#160;</td><td width="99%">&#160;</td></tr>
		</table>
	 </xsl:template>

	 
	 	 
	 <xsl:template match="LOV">
		
		<table class="itemouter" width="100%" cellpadding="0" cellspacing="0">
			<tr><td class="itmeoutertop">&#160;</td><td>&#160;</td></tr>
			<tr><td colspan="1" align="left">&#160;</td><td align="left">
			       <xsl:choose>                                       
                                       <xsl:when test="LOV_TYPE='DYNAMIC' ">
				              <table cellpadding="0" cellspacing="0">                    		
                    		           <xsl:call-template name="ITEM_DETAILS">
                                            <xsl:with-param name="label">LOV Name:</xsl:with-param>
                                            <xsl:with-param name="value"><xsl:value-of  select="@NAME"/></xsl:with-param>    
                                            </xsl:call-template>
                                            <xsl:call-template name="ITEM_DETAILS">
                                            <xsl:with-param name="label">Type:</xsl:with-param>
                                            <xsl:with-param name="value"><xsl:value-of  select="LOV_TYPE"/></xsl:with-param>                       
                                            </xsl:call-template>                             
					           <xsl:call-template name="ITEM_CODE">
                                            <xsl:with-param name="label">QUERY:</xsl:with-param>
                                            <xsl:with-param name="value"><xsl:value-of  disable-output-escaping="yes" select="LOV_QUERY"/></xsl:with-param>                          
                                            </xsl:call-template>										                                              
                                            <xsl:call-template name="ITEM_DETAILS">
                                            <xsl:with-param name="label">Last Updated:</xsl:with-param>
                                            <xsl:with-param name="value"><xsl:value-of select="LAST_UPDATED_BY"/> - <xsl:value-of select="LAST_UPDATED_ON"/></xsl:with-param>                                               
                                           </xsl:call-template>
   
                                      </table>                                                                                                            
					     </xsl:when>	
					     <xsl:otherwise> 						           			           					          
					            <table cellpadding="0" cellspacing="0">   
					             	<xsl:call-template name="ITEM_DETAILS">
                                              <xsl:with-param name="label">LOV Name:</xsl:with-param>
                                              <xsl:with-param name="value"><xsl:value-of  select="@NAME"/></xsl:with-param>    
                                            </xsl:call-template>
                                            <xsl:call-template name="ITEM_DETAILS">
                                              <xsl:with-param name="label">Type:</xsl:with-param>
                                              <xsl:with-param name="value"><xsl:value-of  select="LOV_TYPE"/></xsl:with-param>                       
                                            </xsl:call-template> 
                                            <xsl:call-template name="ITEM_DETAILS">
                                              <xsl:with-param name="label">Last Updated:</xsl:with-param>
                                              <xsl:with-param name="value"><xsl:value-of select="LAST_UPDATED_BY"/> - <xsl:value-of select="LAST_UPDATED_ON"/></xsl:with-param>                                               
                                            </xsl:call-template>
                                            <tr>
                                            <td class="itemlabel" valign="top">&#160;</td>
                                            	 <td align="left">
                                            	 <table cellpadding="0" cellspacing="0" width="50%">
                                            	 	<tr>
                                            	 	<td class="lovhead" align="right" width="15%">Sequence</td>
                                            	 	<td class="lovhead" nowrap="norwap" width="20%" align="left">Display Value</td>
                                            	 	<td  class="lovhead" align="left">Return Value</td></tr>
	                                            	<xsl:for-each select="LOV_DATAS">
						             			<xsl:apply-templates select="LOV_DATA"/>
					             			</xsl:for-each>
					             		  </table></td>
                                            </tr>
					          </table>						          			         
				            </xsl:otherwise>   				            				            				           
					 </xsl:choose>                         					   					       
                    </td></tr>			
			<tr><td class="itmeouterbottom">&#160;</td><td>&#160;</td></tr>

		</table>
	 </xsl:template>
	 	 
        <xsl:template match="LOV_DATA">					                          		                    	
                    <tr>
			     <td class="item" align="right"><xsl:value-of select="LOV_DISP_SEQUENCE"/></td>
			     <td class="item" nowrap="nowrap"><xsl:value-of select="LOV_DISP_VALUE"/></td>
			     <td class="item" nowrap="nowrap"><xsl:value-of select="LOV_RETURN_VALUE"/></td>
			     <!--
			     <td class="tablevalue"><xsl:value-of select="LOV_DISP_COND_TYPE"/></td>
			     <td class="tablevalue"><xsl:value-of select="LOV_DISP_COND"/></td>
			     <td class="tablevalue"><xsl:value-of select="REQUIRED_PATCH"/></td>-->		    
			 </tr>				                   
	 </xsl:template>
	 
	 	 
      <xsl:template match="TREE">
		
		<table class="itemouter" width="100%" cellpadding="0" cellspacing="0">
			<tr><td class="itmeoutertop">&#160;</td><td width="99%">&#160;</td></tr>
			<tr><td colspan="2" align="left">
			
				<table width="100%" cellpadding="0" cellspacing="0">                    		
                    		<xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Tree Name:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="@NAME"/></xsl:with-param>                          
                                  </xsl:call-template>                    					     
                    		<xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Tree Type:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="TREE_TYPE"/></xsl:with-param>                          
                                  </xsl:call-template>										
					<xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Max Levels:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="MAX_LEVELS"/></xsl:with-param>                          
                                  </xsl:call-template>	
                                  <xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Flow Item:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="FLOW_ITEM"/></xsl:with-param>                          
                                  </xsl:call-template>					
					<xsl:call-template name="ITEM_CODE">
                                 <xsl:with-param name="label">Tree Query:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  disable-output-escaping="yes" select="TREE_QUERY"/></xsl:with-param>                          
                                  </xsl:call-template>				
					<xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Before Tree:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="BEFORE_TREE"/></xsl:with-param>                          
                                  </xsl:call-template>					
					<xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">After Tree:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="AFTER_TREE"/></xsl:with-param>                          
                                  </xsl:call-template>				
					<xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Leaf Node:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="LEAF_NODE"/></xsl:with-param>                          
                                  </xsl:call-template>					
					<xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Leaf Node Last:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="LEAF_NODE_LAST"/></xsl:with-param>                          
                                  </xsl:call-template>					
					<xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Drill Up:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="DRILL_UP"/></xsl:with-param>                          
                                  </xsl:call-template>                                
                                 <xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Indent Vertical Line:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="INDENT_VERTICAL_LINE"/></xsl:with-param>                          
                                  </xsl:call-template>                                 				
                                 <xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Indent Vertical Line Last :</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="INDENT_VERTICAL_LINE_LAST"/></xsl:with-param>                          
                                  </xsl:call-template>						
					<xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Unexpanded Parent :</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="UNEXPANDED_PARENT"/></xsl:with-param>                          
                                  </xsl:call-template>					
					<xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Unexpanded Parent Last :</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="UNEXPANDED_PARENT_LAST"/></xsl:with-param>                          
                                  </xsl:call-template>									
					<xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Expanded Parent :</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="EXPANDED_PARENT"/></xsl:with-param>                          
                                  </xsl:call-template>									
					<xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Expanded Parent Last :</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="EXPANDED_PARENT_LAST"/></xsl:with-param>                          
                                  </xsl:call-template>					
					<xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Parent Node Template:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="LEVEL_1_TEMPLATE"/></xsl:with-param>                          
                                  </xsl:call-template>					
					<xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Node Text Template :</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="LEVEL_2_TEMPLATE"/></xsl:with-param>                          
                                  </xsl:call-template>									
					<xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Name Link Anchor Tag :</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="NAME_LINK_ANCHOR_TAG"/></xsl:with-param>                          
                                  </xsl:call-template>
                                  <xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Name Link Not Anchor Tag:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="NAME_LINK_NOT_ANCHOR_TAG"/></xsl:with-param>                          
                                  </xsl:call-template>                                 													
                                 <xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Last Updated:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of select="LAST_UPDATED_BY"/> - <xsl:value-of select="LAST_UPDATED_ON"/></xsl:with-param>                                               
                                 </xsl:call-template>
  				 </table>
				
			</td></tr>
			<tr><td class="itmeouterbottom">&#160;</td><td width="99%">&#160;</td></tr>
		</table>
	 </xsl:template>
	 
	 
	   <xsl:template match="LIST">
		
		<table class="itemouter" width="100%" cellpadding="0" cellspacing="0">
			<tr><td class="itmeoutertop">&#160;</td><td width="99%">&#160;</td></tr>
			<tr><td colspan="2" align="left">
			
				<table width="100%" cellpadding="0" cellspacing="0">                    		
                    		<xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">List Name:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="@NAME"/></xsl:with-param>                          
                                  </xsl:call-template>                    					     
                    		<xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">List Status:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="LIST_STATUS"/></xsl:with-param>                          
                                  </xsl:call-template>										
					<xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Displayed:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="LIST_DISPLAYED"/></xsl:with-param>                          
                                  </xsl:call-template>	
                                  <xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">List Template:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="DISPLAY_ROW_TEMPLATE_ID"/></xsl:with-param>                          
                                  </xsl:call-template>													
					<xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Build Option:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="REQUIRED_PATCH"/></xsl:with-param>                          
                                  </xsl:call-template>                             
                                 <xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Last Updated:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of select="LAST_UPDATED_BY"/> - <xsl:value-of select="LAST_UPDATED_ON"/></xsl:with-param>                                               
                                 </xsl:call-template>
                                 
                            <tr><td class="itemlabel" valign="top">Items:</td>
                                  <td align="left">
                                  <!--<table cellpadding="0" cellspacing="0" width="50%">   -->                                                                               
	                                       <xsl:for-each select="LIST_ITEMS">
						             			<xsl:apply-templates select="LIST_ITEM"/>
					             	 </xsl:for-each>
					       <!-- </table>-->
					        </td>
                            </tr>
                 </table>				
			</td></tr>
			<tr><td class="itmeouterbottom">&#160;</td><td width="99%">&#160;</td></tr>
		</table>
	 </xsl:template>
	 
	 <xsl:template match="LIST_ITEM">					                          		                    	
            <table class="itemouter" cellpadding="0" cellspacing="0">
		      <tr><td class="itmeoutertop">&#160;</td><td>&#160;</td></tr>
		      <tr><td colspan="2" align="left">		      
                <table width="100%" cellpadding="0" cellspacing="0"> 		      
			
			<!--	<table width="100%" cellpadding="0" cellspacing="0">			     
				<td class="item" align="right"><xsl:value-of select="LOV_DISP_SEQUENCE"/></td>
			     <td class="item" nowrap="nowrap"><xsl:value-of select="LOV_DISP_VALUE"/></td>
			     <td class="item" nowrap="nowrap"><xsl:value-of select="LOV_RETURN_VALUE"/></td>			     	    
			     </table>-->
			     <xsl:call-template name="ITEM_DETAILS">
                     <xsl:with-param name="label">Sequence:</xsl:with-param>
                     <xsl:with-param name="value"><xsl:value-of  select="LIST_ITEM_DISPLAY_SEQUENCE"/></xsl:with-param>    
                     </xsl:call-template>
                     
			     <xsl:call-template name="ITEM_DETAILS">
                     <xsl:with-param name="label">Item Type:</xsl:with-param>
                     <xsl:with-param name="value"><xsl:value-of  select="LIST_ITEM_TYPE"/></xsl:with-param>    
                     </xsl:call-template>
			     <xsl:call-template name="ITEM_DETAILS">
                     <xsl:with-param name="label">Status:</xsl:with-param>
                     <xsl:with-param name="value"><xsl:value-of  select="LIST_ITEM_STATUS"/></xsl:with-param>    
                     </xsl:call-template>
			     <xsl:call-template name="ITEM_DETAILS">
                     <xsl:with-param name="label">Displayed:</xsl:with-param>
                     <xsl:with-param name="value"><xsl:value-of  select="ITEM_DISPLAYED"/></xsl:with-param>    
                     </xsl:call-template>
			     <xsl:call-template name="ITEM_DETAILS">
                     <xsl:with-param name="label">List Item Link Text:</xsl:with-param>
                     <xsl:with-param name="value"><xsl:value-of  select="LIST_ITEM_LINK_TEXT"/></xsl:with-param>    
                     </xsl:call-template>
			     <xsl:call-template name="ITEM_DETAILS">
                     <xsl:with-param name="label">Link Target:</xsl:with-param>
                     <xsl:with-param name="value"><xsl:value-of  select="LIST_ITEM_LINK_TARGET"/></xsl:with-param>    
                     </xsl:call-template>
			     <xsl:call-template name="ITEM_DETAILS">
                     <xsl:with-param name="label">Image:</xsl:with-param>
                     <xsl:with-param name="value"><xsl:value-of  select="LIST_ITEM_ICON"/></xsl:with-param>    
                     </xsl:call-template>
			     <xsl:call-template name="ITEM_DETAILS">
                     <xsl:with-param name="label">Image Attributes:</xsl:with-param>
                     <xsl:with-param name="value"><xsl:value-of  select="LIST_ITEM_ICON_ATTRIBUTES"/></xsl:with-param>    
                     </xsl:call-template>
			     <xsl:call-template name="ITEM_DETAILS">
                     <xsl:with-param name="label">Item Owner:</xsl:with-param>
                     <xsl:with-param name="value"><xsl:value-of  select="LIST_ITEM_OWNER"/></xsl:with-param>    
                     </xsl:call-template>
			     <xsl:call-template name="ITEM_DETAILS">
                     <xsl:with-param name="label">List Item Current for Pages Type:</xsl:with-param>
                     <xsl:with-param name="value"><xsl:value-of  select="LIST_ITEM_CURRENT_FOR_PAGES"/></xsl:with-param>    
                     </xsl:call-template>
			     <xsl:call-template name="ITEM_DETAILS">
                     <xsl:with-param name="label">List Item Current for Condition:</xsl:with-param>
                     <xsl:with-param name="value"><xsl:value-of  select="LIST_ITEM_CURRENT_TYPE"/></xsl:with-param>    
                     </xsl:call-template>
			     <xsl:call-template name="ITEM_DETAILS">
                     <xsl:with-param name="label">Condition Type:</xsl:with-param>
                     <xsl:with-param name="value"><xsl:value-of  select="LIST_ITEM_DISP_COND_TYPE"/></xsl:with-param>    
                     </xsl:call-template>
			     <xsl:call-template name="ITEM_DETAILS">
                     <xsl:with-param name="label">Expression 1:</xsl:with-param>
                     <xsl:with-param name="value"><xsl:value-of  select="LIST_ITEM_DISP_CONDITION"/></xsl:with-param>    
                     </xsl:call-template>			  
			     <xsl:call-template name="ITEM_DETAILS">
                     <xsl:with-param name="label">Expression 2:</xsl:with-param>
                     <xsl:with-param name="value"><xsl:value-of  select="LIST_ITEM_DISP_CONDITION2"/></xsl:with-param>    
                     </xsl:call-template>
			     <xsl:call-template name="ITEM_DETAILS">
                     <xsl:with-param name="label">Count Clicks:</xsl:with-param>
                     <xsl:with-param name="value"><xsl:value-of  select="LIST_COUNTCLICKS_Y_N"/></xsl:with-param>    
                     </xsl:call-template>
			     <xsl:call-template name="ITEM_DETAILS">
                     <xsl:with-param name="label">Click Count Category:</xsl:with-param>
                     <xsl:with-param name="value"><xsl:value-of  select="LIST_COUNTCLICKS_CAT"/></xsl:with-param>    
                     </xsl:call-template>
			     <xsl:call-template name="ITEM_DETAILS">
                     <xsl:with-param name="label">List Text 1:</xsl:with-param>
                     <xsl:with-param name="value"><xsl:value-of  select="LIST_TEXT_01"/></xsl:with-param>    
                     </xsl:call-template>
			     <xsl:call-template name="ITEM_DETAILS">
                     <xsl:with-param name="label">List Text 2:</xsl:with-param>
                     <xsl:with-param name="value"><xsl:value-of  select="LIST_TEXT_02"/></xsl:with-param>    
                     </xsl:call-template>
			     <xsl:call-template name="ITEM_DETAILS">
                     <xsl:with-param name="label">List Text 3:</xsl:with-param>
                     <xsl:with-param name="value"><xsl:value-of  select="LIST_TEXT_03"/></xsl:with-param>    
                     </xsl:call-template>
			     <xsl:call-template name="ITEM_DETAILS">
                     <xsl:with-param name="label">List Text 4:</xsl:with-param>
                     <xsl:with-param name="value"><xsl:value-of  select="LIST_TEXT_04"/></xsl:with-param>    
                     </xsl:call-template>
			     <xsl:call-template name="ITEM_DETAILS">
                     <xsl:with-param name="label">List Text 5:</xsl:with-param>
                     <xsl:with-param name="value"><xsl:value-of  select="LIST_TEXT_05"/></xsl:with-param>    
                     </xsl:call-template>
			     <xsl:call-template name="ITEM_DETAILS">
                     <xsl:with-param name="label">List Text 6:</xsl:with-param>
                     <xsl:with-param name="value"><xsl:value-of  select="LIST_TEXT_06"/></xsl:with-param>    
                     </xsl:call-template>
			     <xsl:call-template name="ITEM_DETAILS">
                     <xsl:with-param name="label">List Text 7:</xsl:with-param>
                     <xsl:with-param name="value"><xsl:value-of  select="LIST_TEXT_07"/></xsl:with-param>    
                     </xsl:call-template>
			     <xsl:call-template name="ITEM_DETAILS">
                     <xsl:with-param name="label">List Text 8:</xsl:with-param>
                     <xsl:with-param name="value"><xsl:value-of  select="LIST_TEXT_08"/></xsl:with-param>    
                     </xsl:call-template>
			     <xsl:call-template name="ITEM_DETAILS">
                     <xsl:with-param name="label">List Text 9:</xsl:with-param>
                     <xsl:with-param name="value"><xsl:value-of  select="LIST_TEXT_09"/></xsl:with-param>    
                     </xsl:call-template>
                     <xsl:call-template name="ITEM_DETAILS">
                     <xsl:with-param name="label">List Text 10:</xsl:with-param>
                     <xsl:with-param name="value"><xsl:value-of  select="LIST_TEXT_10"/></xsl:with-param>    
                     </xsl:call-template>
                     <xsl:call-template name="ITEM_DETAILS">
                     <xsl:with-param name="label">Security Scheme:</xsl:with-param>
                     <xsl:with-param name="value"><xsl:value-of  select="SECURITY_SCHEME"/></xsl:with-param>    
                     </xsl:call-template>
                     <xsl:call-template name="ITEM_DETAILS">
                     <xsl:with-param name="label">Build Option:</xsl:with-param>
                     <xsl:with-param name="value"><xsl:value-of  select="REQUIRED_PATCH"/></xsl:with-param>    
                     </xsl:call-template>
                     <xsl:call-template name="ITEM_DETAILS">
                     <xsl:with-param name="label">Last Updated:</xsl:with-param>
                     <xsl:with-param name="value"><xsl:value-of select="LAST_UPDATED_BY"/> - <xsl:value-of select="LAST_UPDATED_ON"/></xsl:with-param>                                               
                     </xsl:call-template>
			</table>	
			</td></tr>
			<tr><td class="itmeouterbottom">&#160;</td><td width="99%">&#160;</td></tr>
           </table>		                   
	 </xsl:template>
	 
	 
	  <xsl:template match="MENU">
		
		<table class="itemouter" width="100%" cellpadding="0" cellspacing="0">
			<tr><td class="itmeoutertop">&#160;</td><td width="99%">&#160;</td></tr>
			<tr><td colspan="2" align="left">
			
				<table width="100%" cellpadding="0" cellspacing="0">                    		
                    		<xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Menu Name:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="@NAME"/></xsl:with-param>                          
                                  </xsl:call-template>                    					                         		
                                 <xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Last Updated:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of select="LAST_UPDATED_BY"/> - <xsl:value-of select="LAST_UPDATED_ON"/></xsl:with-param>                                               
                                 </xsl:call-template>
                                 
                            <tr><td class="itemlabel" valign="top">Options:</td>
                                  <td align="left">
                                  <!--<table cellpadding="0" cellspacing="0" width="50%">   -->                                                                               
	                                       <xsl:for-each select="MENU_OPTIONS">
						             			<xsl:apply-templates select="MENU_OPTION"/>
					             	 </xsl:for-each>
					       <!-- </table>-->
					        </td>
                            </tr>
                 </table>				
			</td></tr>
			<tr><td class="itmeouterbottom">&#160;</td><td width="99%">&#160;</td></tr>
		</table>
	 </xsl:template>
	 
	 <xsl:template match="MENU_OPTION">					                          		                    	
            <table class="itemouter" cellpadding="0" cellspacing="0">
		      <tr><td class="itmeoutertop">&#160;</td><td>&#160;</td></tr>
		      <tr><td colspan="2" align="left">		      
                <table width="100%" cellpadding="0" cellspacing="0">
			 <xsl:call-template name="ITEM_DETAILS">
                     <xsl:with-param name="label">Display Sequence:</xsl:with-param>
                     <xsl:with-param name="value"><xsl:value-of  select="OPTION_SEQUENCE"/></xsl:with-param>    
                     </xsl:call-template>
			 <xsl:call-template name="ITEM_DETAILS">
                     <xsl:with-param name="label">Page ID:</xsl:with-param>
                     <xsl:with-param name="value"><xsl:value-of  select="PAGE_ID"/></xsl:with-param>    
                     </xsl:call-template>
			 <xsl:call-template name="ITEM_DETAILS">
                     <xsl:with-param name="label">Parent Menu Option:</xsl:with-param>
                     <xsl:with-param name="value"><xsl:value-of  select="PARENT_ID"/></xsl:with-param>    
                     </xsl:call-template>
			 <xsl:call-template name="ITEM_DETAILS">
                     <xsl:with-param name="label">Short Name:</xsl:with-param>
                     <xsl:with-param name="value"><xsl:value-of  select="SHORT_NAME"/></xsl:with-param>    
                     </xsl:call-template>
			 <xsl:call-template name="ITEM_DETAILS">
                     <xsl:with-param name="label">Long Name:</xsl:with-param>
                     <xsl:with-param name="value"><xsl:value-of  select="LONG_NAME"/></xsl:with-param>    
                     </xsl:call-template>
			 <xsl:call-template name="ITEM_DETAILS">
                     <xsl:with-param name="label">Link:</xsl:with-param>
                     <xsl:with-param name="value"><xsl:value-of  select="LINK"/></xsl:with-param>    
                     </xsl:call-template>
			 <xsl:call-template name="ITEM_DETAILS">
                     <xsl:with-param name="label">Also Current For Pages:</xsl:with-param>
                     <xsl:with-param name="value"><xsl:value-of  select="ALSO_CURRENT_FOR_PAGES"/></xsl:with-param>    
                     </xsl:call-template>
			 <xsl:call-template name="ITEM_DETAILS">
                     <xsl:with-param name="label">Display Condition Type:</xsl:with-param>
                     <xsl:with-param name="value"><xsl:value-of  select="DISPLAY_WHEN_COND_TYPE"/></xsl:with-param>    
                     </xsl:call-template>
			 <xsl:call-template name="ITEM_DETAILS">
                     <xsl:with-param name="label">Expression 1:</xsl:with-param>
                     <xsl:with-param name="value"><xsl:value-of  select="DISPLAY_WHEN_CONDITION"/></xsl:with-param>    
                     </xsl:call-template>
			<xsl:call-template name="ITEM_DETAILS">
                     <xsl:with-param name="label">Expression 2:</xsl:with-param>
                     <xsl:with-param name="value"><xsl:value-of  select="DISPLAY_WHEN_CONDITION2"/></xsl:with-param>    
                     </xsl:call-template>
			 <xsl:call-template name="ITEM_DETAILS">
                     <xsl:with-param name="label">Security Scheme:</xsl:with-param>
                     <xsl:with-param name="value"><xsl:value-of  select="SECURITY_SCHEME"/></xsl:with-param>    
                     </xsl:call-template>
			 <xsl:call-template name="ITEM_DETAILS">
                     <xsl:with-param name="label">Build Option:</xsl:with-param>
                     <xsl:with-param name="value"><xsl:value-of  select="REQUIRED_PATCH"/></xsl:with-param>    
                     </xsl:call-template>
                     <xsl:call-template name="ITEM_DETAILS">
                     <xsl:with-param name="label">Last Updated:</xsl:with-param>
                     <xsl:with-param name="value"><xsl:value-of select="LAST_UPDATED_BY"/> - <xsl:value-of select="LAST_UPDATED_ON"/></xsl:with-param>                                               
                     </xsl:call-template>
			</table>	
			</td></tr>
			<tr><td class="itmeouterbottom">&#160;</td><td width="99%">&#160;</td></tr>
           </table>		                   
	 </xsl:template>

	 
	 
	 
	   <xsl:template match="SHORTCUT">
		
		<table class="itemouter" width="100%" cellpadding="0" cellspacing="0">
			<tr><td class="itmeoutertop">&#160;</td><td width="99%">&#160;</td></tr>
			<tr><td colspan="2" align="left">
			
				<table width="100%" cellpadding="0" cellspacing="0">                    		
                    		<xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Shortcut Name:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="@NAME"/></xsl:with-param>                          
                                  </xsl:call-template>     
                                  <xsl:call-template name="ITEM_DETAILS2">
                                 <xsl:with-param name="label">Subscription:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="SUBSCRIPTION"/></xsl:with-param>                          
                                  </xsl:call-template>                 					     
                    		<xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Sequence:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="SHORTCUT_CONSIDERATION_SEQ"/></xsl:with-param>                          
                                  </xsl:call-template>										
					<xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Type:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="SHORTCUT_TYPE"/></xsl:with-param>                          
                                  </xsl:call-template>	
                                  <xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Shortcut:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="SHORTCUT"/></xsl:with-param>                          
                                  </xsl:call-template>                                  
                                  <xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Error Text:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="ERROR_TEXT"/></xsl:with-param>                          
                                  </xsl:call-template>                                 
                                  <xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Build Option:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="BUILD_OPTION"/></xsl:with-param>                          
                                  </xsl:call-template>	
                                  <xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Comments:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="COMMENTS"/></xsl:with-param>                          
                                 </xsl:call-template>	
                                 <xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Last Updated:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of select="LAST_UPDATED_BY"/> - <xsl:value-of select="LAST_UPDATED_ON"/></xsl:with-param>                                               
                                 </xsl:call-template>
  				 </table>				
			</td></tr>
			<tr><td class="itmeouterbottom">&#160;</td><td width="99%">&#160;</td></tr>
		</table>
	 </xsl:template>

	 
	 <xsl:template match="PAGE_TEMPLATE">
	 <table class="itemouter" width="100%" cellpadding="0" cellspacing="0">
			<tr><td class="itmeoutertop">&#160;</td><td width="99%">&#160;</td></tr>
			<tr><td colspan="2" align="left">
	
	           <table width="100%" cellpadding="0" cellspacing="0">   
	                   <xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Page Template Name:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="@NAME"/></xsl:with-param>                          
                                  </xsl:call-template> 
                         <xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Utilization:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="UTILIZATION"/></xsl:with-param>                          
                                  </xsl:call-template>  
                         <xsl:call-template name="ITEM_DETAILS2">
                                 <xsl:with-param name="label">Subscription:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="SUBSCRIPTION"/></xsl:with-param>                          
                                  </xsl:call-template> 
			    <xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Header Template:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="HEADER_TEMPLATE"/></xsl:with-param>                          
                                  </xsl:call-template>	
                        <xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Body:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="BOX"/></xsl:with-param>                          
                                  </xsl:call-template>	
                 	   <xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Footer Template:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="FOOTER_TEMPLATE"/></xsl:with-param>                                                           
                                  </xsl:call-template>                            
                          <xsl:call-template name="ITEM_DETAILS">
                                  <xsl:with-param name="label">Region Table Attributes:</xsl:with-param>
                                  <xsl:with-param name="value"><xsl:value-of  select="REGION_TABLE_CATTRIBUTES"/></xsl:with-param>                          
                                  </xsl:call-template>        
                         <xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Error Page Template:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="ERROR_PAGE_TEMPLATE"/></xsl:with-param>                          
                                  </xsl:call-template>
                         <xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Template Comment:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="TEMPLATE_COMMENT"/></xsl:with-param>                          
                                  </xsl:call-template>                              
                          <xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Last Updated:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of select="LAST_UPDATED_BY"/> - <xsl:value-of select="LAST_UPDATED_ON"/></xsl:with-param>                                               
                                 </xsl:call-template>     
                         </table> 		
                                    
                                  
                        <!-- SUBTEMPLATE DEFINITIONS -->        
                         <xsl:if test="string-length(BODY_TITLE) &gt; 0 or string-length(SUCCESS_MESSAGE) &gt; 0 or string-length(NAVIGATION_BAR) &gt; 0 or string-length(MESSAGE) &gt; 0 ">
                         <table cellpadding="0" cellspacing="0">  
                         <tr><td class="lovhead" align="left">Subtemplate Definitions</td></tr>
                         <tr><td align="left">                                                                                                            
	                         <table class="itemouter" cellpadding="0" cellspacing="0">
		                    <tr><td class="itmeoutertop">&#160;</td><td>&#160;</td></tr>
		                    <tr><td colspan="2" align="left">		      
                                  <table cellpadding="0" cellspacing="0"> 	
                			            <xsl:call-template name="ITEM_DETAILS">
                                            <xsl:with-param name="label">Current Tab:</xsl:with-param>
                                            <xsl:with-param name="value"><xsl:value-of  select="CURRENT_TAB"/></xsl:with-param>                          
                                            </xsl:call-template>		
                                            <xsl:call-template name="ITEM_DETAILS">
                                            <xsl:with-param name="label">Current Tab Font Attribute:</xsl:with-param>
                                            <xsl:with-param name="value"><xsl:value-of  select="CURRENT_TAB_FONT_ATTR"/></xsl:with-param>                          
                                            </xsl:call-template>	
                                            <xsl:call-template name="ITEM_DETAILS">
                                            <xsl:with-param name="label">Non Current Tab:</xsl:with-param>
                                            <xsl:with-param name="value"><xsl:value-of  select="NON_CURRENT_TAB"/></xsl:with-param>                          
                                            </xsl:call-template>	
                                            <xsl:call-template name="ITEM_DETAILS">
                                            <xsl:with-param name="label">Non Current Tab Font Attribute:</xsl:with-param>
                                            <xsl:with-param name="value"><xsl:value-of  select="NON_CURRENT_TAB_FONT_ATTR"/></xsl:with-param>                          
                                            </xsl:call-template>
                                  </table>	
			              </td></tr>
			              <tr><td class="itmeouterbottom">&#160;</td><td width="99%">&#160;</td></tr>
                                </table>		                   	                          
			     </td></tr>
                         </table>
                         </xsl:if>
                         
                         <!-- STANDARD TAB ATTRIBUTES -->
                         <xsl:if test="string-length(CURRENT_TAB) &gt; 0 or string-length(CURRENT_TAB_FONT_ATTR) &gt; 0 or string-length(NON_CURRENT_TAB) &gt; 0 or string-length(NON_CURRENT_TAB_FONT_ATTR) &gt; 0 ">
                         <table cellpadding="0" cellspacing="0">  
                         <tr><td class="lovhead" align="left">Standard Tab Attributes</td></tr>
                         <tr><td align="left">                                                                                                            
	                         <table class="itemouter" cellpadding="0" cellspacing="0">
		                       <tr><td class="itmeoutertop">&#160;</td><td>&#160;</td></tr>
		                       <tr><td colspan="2" align="left">		      
                                  <table cellpadding="0" cellspacing="0"> 	
                			            <xsl:call-template name="ITEM_DETAILS">
                                            <xsl:with-param name="label">Current Tab:</xsl:with-param>
                                            <xsl:with-param name="value"><xsl:value-of  select="CURRENT_TAB"/></xsl:with-param>                          
                                            </xsl:call-template>		
                                            <xsl:call-template name="ITEM_DETAILS">
                                            <xsl:with-param name="label">Current Tab Font Attribute:</xsl:with-param>
                                            <xsl:with-param name="value"><xsl:value-of  select="CURRENT_TAB_FONT_ATTR"/></xsl:with-param>                          
                                            </xsl:call-template>	
                                            <xsl:call-template name="ITEM_DETAILS">
                                            <xsl:with-param name="label">Non Current Tab:</xsl:with-param>
                                            <xsl:with-param name="value"><xsl:value-of  select="NON_CURRENT_TAB"/></xsl:with-param>                          
                                            </xsl:call-template>	
                                            <xsl:call-template name="ITEM_DETAILS">
                                            <xsl:with-param name="label">Non Current Tab Font Attribute:</xsl:with-param>
                                            <xsl:with-param name="value"><xsl:value-of  select="NON_CURRENT_TAB_FONT_ATTR"/></xsl:with-param>                          
                                            </xsl:call-template>
                                  </table>	
			              </td></tr>
			              <tr><td class="itmeouterbottom">&#160;</td><td width="99%">&#160;</td></tr>
                              </table>		                   	                          
			     </td></tr>
			     </table>
                         </xsl:if>
                         
                         <!-- IMAGE TAB ATTRIBUTES -->
                         <xsl:if test="string-length(TOP_CURRENT_TAB) &gt; 0 or string-length(TOP_CURRENT_TAB_FONT_ATTR) &gt; 0 or string-length(TOP_NON_CURRENT_TAB) &gt; 0 or string-length(TOP_NON_CURRENT_TAB_FONT_ATTR) &gt; 0 ">
                         <table cellpadding="0" cellspacing="0">  
                         <tr><td class="lovhead" align="left">Image Tab Attributes</td></tr>
                         <tr><td align="left">                                                                                                            
	                         <table class="itemouter" cellpadding="0" cellspacing="0">
		                       <tr><td class="itmeoutertop">&#160;</td><td>&#160;</td></tr>
		                       <tr><td colspan="2" align="left">		      
                                  <table cellpadding="0" cellspacing="0"> 	
                			             <xsl:call-template name="ITEM_DETAILS">
                                             <xsl:with-param name="label">Parent Current Tab:</xsl:with-param>
                                             <xsl:with-param name="value"><xsl:value-of  select="TOP_CURRENT_TAB"/></xsl:with-param>                          
                                             </xsl:call-template>	
                                             <xsl:call-template name="ITEM_DETAILS">
                                             <xsl:with-param name="label">Parent Current Tab Font Attributes:</xsl:with-param>
                                             <xsl:with-param name="value"><xsl:value-of  select="TOP_CURRENT_TAB_FONT_ATTR"/></xsl:with-param>                          
                                             </xsl:call-template>	
                                             <xsl:call-template name="ITEM_DETAILS">
                                             <xsl:with-param name="label">Parent Non Current Tab:</xsl:with-param>
                                             <xsl:with-param name="value"><xsl:value-of  select="TOP_NON_CURRENT_TAB"/></xsl:with-param>                          
                                             </xsl:call-template>	
                                             <xsl:call-template name="ITEM_DETAILS">
                                             <xsl:with-param name="label">Parent Non Current Tab Font Attributes:</xsl:with-param>
                                             <xsl:with-param name="value"><xsl:value-of  select="TOP_NON_CURRENT_TAB_FONT_ATTR"/></xsl:with-param>                          
                                             </xsl:call-template>	
                                  </table>	
			              </td></tr>
			              <tr><td class="itmeouterbottom">&#160;</td><td width="99%">&#160;</td></tr>
                              </table>		                   	                          
				   </td></tr>
				   </table>
                         </xsl:if>
                         
                         <!--IMAGE TAB ATTRIBUTES -->
                         <xsl:if test="string-length(CURRENT_IMAGE_TAB) &gt; 0 or string-length(NON_CURRENT_IMAGE_TAB) &gt; 0 ">
                         <table cellpadding="0" cellspacing="0">
                         <tr><td class="lovhead" align="left">Image Tab Attributes</td></tr>
                         <tr><td align="left">                                                                                                            
	                         <table class="itemouter" cellpadding="0" cellspacing="0">
		                       <tr><td class="itmeoutertop">&#160;</td><td>&#160;</td></tr>
		                       <tr><td colspan="2" align="left">		      
                                  <table cellpadding="0" cellspacing="0"> 	
                			             <xsl:call-template name="ITEM_DETAILS">
                                             <xsl:with-param name="label">Current Image Tab:</xsl:with-param>
                                             <xsl:with-param name="value"><xsl:value-of  select="CURRENT_IMAGE_TAB"/></xsl:with-param>                          
                                             </xsl:call-template>	
                                             <xsl:call-template name="ITEM_DETAILS">
                                             <xsl:with-param name="label">Non Current Image Tab:</xsl:with-param>
                                             <xsl:with-param name="value"><xsl:value-of  select="NON_CURRENT_IMAGE_TAB"/></xsl:with-param>                          
                                             </xsl:call-template>	
                                  </table>	
			              </td></tr>
			              <tr><td class="itmeouterbottom">&#160;</td><td width="99%">&#160;</td></tr>
                              </table>		                   	                          
				   </td></tr>
			     </table>
                         </xsl:if>
                         
                         <!-- APPLICATION TAB ATTRIBUTES -->
                         <xsl:if test="string-length(APP_TAB_BEFORE_TABS) &gt; 0 or string-length(APP_TAB_CURRENT_TAB) &gt; 0 or string-length(APP_TAB_NON_CURRENT_TAB) &gt; 0 or string-length(APP_TAB_AFTER_TABS) &gt; 0 ">
                         <table cellpadding="0" cellspacing="0">
                         <tr><td class="lovhead" align="left">Application Tab Attributes</td></tr>
                         <tr><td align="left">                                                                                                            
	                         <table class="itemouter" cellpadding="0" cellspacing="0">
		                       <tr><td class="itmeoutertop">&#160;</td><td>&#160;</td></tr>
		                       <tr><td colspan="2" align="left">		      
                                  <table cellpadding="0" cellspacing="0"> 	
                			              <xsl:call-template name="ITEM_DETAILS">
                                              <xsl:with-param name="label">Before Application Tabs:</xsl:with-param>
                                              <xsl:with-param name="value"><xsl:value-of  select="APP_TAB_BEFORE_TABS"/></xsl:with-param>                          
                                              </xsl:call-template>	
                                              <xsl:call-template name="ITEM_DETAILS">
                                              <xsl:with-param name="label">Application Tabs Current Tab:</xsl:with-param>
                                              <xsl:with-param name="value"><xsl:value-of  select="APP_TAB_CURRENT_TAB"/></xsl:with-param>                          
                                              </xsl:call-template>	
                                              <xsl:call-template name="ITEM_DETAILS">
                                              <xsl:with-param name="label">Non Current Application Tab:</xsl:with-param>
                                              <xsl:with-param name="value"><xsl:value-of  select="APP_TAB_NON_CURRENT_TAB"/></xsl:with-param>                          
                                              </xsl:call-template>	
                                              <xsl:call-template name="ITEM_DETAILS">
                                              <xsl:with-param name="label">After Application Tabs:</xsl:with-param>
                                              <xsl:with-param name="value"><xsl:value-of  select="APP_TAB_AFTER_TABS"/></xsl:with-param>                          
                                              </xsl:call-template>	
                                  </table>	
			              </td></tr>
			              <tr><td class="itmeouterbottom">&#160;</td><td width="99%">&#160;</td></tr>
                              </table>		                   	                          
				   </td></tr>
			     </table>
                         </xsl:if>       
                  
                         
                         <!-- Look Customization Options -->                         
                         <table cellpadding="0" cellspacing="0">
                         <tr><td class="lovhead" align="left">Look Customization Options</td></tr>
                         <tr><td align="left">                                                                                                            
	                         <table class="itemouter" cellpadding="0" cellspacing="0">
		                       <tr><td class="itmeoutertop">&#160;</td><td>&#160;</td></tr>
		                       <tr><td colspan="2" align="left">		      
                                  <table cellpadding="0" cellspacing="0"> 	
                			                <xsl:call-template name="ITEM_DETAILS">
                                                <xsl:with-param name="label">Look:</xsl:with-param>
                                                <xsl:with-param name="value"><xsl:value-of  select="LOOK"/></xsl:with-param>                          
                                                </xsl:call-template>		
                                                <xsl:call-template name="ITEM_DETAILS">
                                                <xsl:with-param name="label">Button Default Position:</xsl:with-param>
                                                <xsl:with-param name="value"><xsl:value-of  select="DEFAULT_BUTTON_POSITION"/></xsl:with-param>                          
                                                </xsl:call-template>	
                                                <xsl:call-template name="ITEM_DETAILS">
                                                <xsl:with-param name="label">Table BGCOLOR:</xsl:with-param>
                                                <xsl:with-param name="value"><xsl:value-of  select="TABLE_BGCOLOR"/></xsl:with-param>                          
                                                </xsl:call-template>	
                                                <xsl:call-template name="ITEM_DETAILS">
                                                <xsl:with-param name="label">Table Heading BGCOLOR:</xsl:with-param>
                                                <xsl:with-param name="value"><xsl:value-of  select="HEADING_BGCOLOR"/></xsl:with-param>                          
                                                </xsl:call-template>	
                                                <xsl:call-template name="ITEM_DETAILS">
                                                <xsl:with-param name="label">Table Attributes:</xsl:with-param>
                                                <xsl:with-param name="value"><xsl:value-of  select="TABLE_CATTRIBUTES"/></xsl:with-param>                          
                                                </xsl:call-template>	
                                                <xsl:call-template name="ITEM_DETAILS">
                                                <xsl:with-param name="label">Font Size:</xsl:with-param>
                                                <xsl:with-param name="value"><xsl:value-of  select="FONT_SIZE"/></xsl:with-param>                          
                                                </xsl:call-template>	
                                                <xsl:call-template name="ITEM_DETAILS">
                                                <xsl:with-param name="label">Font Face:</xsl:with-param>
                                                <xsl:with-param name="value"><xsl:value-of  select="FONT_FACE"/></xsl:with-param>                          
                                                </xsl:call-template>	                                                
                                                <xsl:call-template name="ITEM_DETAILS">
                                                <xsl:with-param name="label">Attribute 1:</xsl:with-param>
                                                <xsl:with-param name="value"><xsl:value-of  select="ATTRIBUTE1"/></xsl:with-param>                          
                                                </xsl:call-template>	
                                                <xsl:call-template name="ITEM_DETAILS">
                                                <xsl:with-param name="label">Attribute 2:</xsl:with-param>
                                                <xsl:with-param name="value"><xsl:value-of  select="ATTRIBUTE2"/></xsl:with-param>                          
                                                </xsl:call-template>	
                                                <xsl:call-template name="ITEM_DETAILS">
                                                <xsl:with-param name="label">Attribute 3:</xsl:with-param>
                                                <xsl:with-param name="value"><xsl:value-of  select="ATTRIBUTE3"/></xsl:with-param>                          
                                                </xsl:call-template>	
                                                <xsl:call-template name="ITEM_DETAILS">
                                                <xsl:with-param name="label">Attribute 4:</xsl:with-param>
                                                <xsl:with-param name="value"><xsl:value-of  select="ATTRIBUTE4"/></xsl:with-param>                          
                                                </xsl:call-template>	
                                                <xsl:call-template name="ITEM_DETAILS">
                                                <xsl:with-param name="label">Attribute 5:</xsl:with-param>
                                                <xsl:with-param name="value"><xsl:value-of  select="ATTRIBUTE5"/></xsl:with-param>                          
                                                </xsl:call-template>	                                                
                                                <xsl:call-template name="ITEM_DETAILS">
                                                <xsl:with-param name="label">Attribute 6:</xsl:with-param>
                                                <xsl:with-param name="value"><xsl:value-of  select="ATTRIBUTE6"/></xsl:with-param>                          
                                                </xsl:call-template>	
                                                <xsl:call-template name="ITEM_DETAILS">
                                                <xsl:with-param name="label">Build Option:</xsl:with-param>
                                                <xsl:with-param name="value"><xsl:value-of  select="REQUIRED_PATCH"/></xsl:with-param>                          
                                  </xsl:call-template>            
									
                                  </table>	
			              </td></tr>
			              <tr><td class="itmeouterbottom">&#160;</td><td width="99%">&#160;</td></tr>
                              </table>		                   	                          
				   </td></tr>  
              </table>
        </td></tr>
	   <tr><td class="itmeouterbottom">&#160;</td><td width="99%">&#160;</td></tr>
        </table>                 
	 </xsl:template>
	 
		 

        <xsl:template match="REGION_TEMPLATE">
		
		<table class="itemouter" width="100%" cellpadding="0" cellspacing="0">
			<tr><td class="itmeoutertop">&#160;</td><td width="99%">&#160;</td></tr>
			<tr><td colspan="2" align="left">
			
				<table width="100%" cellpadding="0" cellspacing="0">                    		
                    		<xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Region Template Name:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="@NAME"/></xsl:with-param>                          
                                  </xsl:call-template> 
                                  <xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Utilization:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="UTILIZATION"/></xsl:with-param>                          
                                  </xsl:call-template>	
                                  <xsl:call-template name="ITEM_DETAILS2">
                                 <xsl:with-param name="label">Subscription:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="SUBSCRIPTION"/></xsl:with-param>                          
                                  </xsl:call-template>       					     
                    		<xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Template:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="TEMPLATE"/></xsl:with-param>                          
                                  </xsl:call-template>										
					<xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Region Template Look 2:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="TEMPLATE2"/></xsl:with-param>                          
                                  </xsl:call-template>	
                                  <xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Region Template Look 3:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="TEMPLATE3"/></xsl:with-param>                          
                                  </xsl:call-template>     
                                  <xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Table BGCOLOR:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="PLUG_TABLE_BGCOLOR"/></xsl:with-param>                          
                                  </xsl:call-template>
                                  <xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Table Heading BGCOLOR:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="PLUG_HEADING_BGCOLOR"/></xsl:with-param>                          
                                  </xsl:call-template>
                                  <xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Font Size:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="PLUG_FONT_SIZE"/></xsl:with-param>                          
                                  </xsl:call-template> 
                                  <xsl:call-template name="ITEM_DETAILS">                                
                                 <xsl:with-param name="label">Template Comment:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="TEMPLATE_COMMENT"/></xsl:with-param>                          
                                  </xsl:call-template>		
                                  <xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Last Updated:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of select="LAST_UPDATED_BY"/> - <xsl:value-of select="LAST_UPDATED_ON"/></xsl:with-param>                                               
                                 </xsl:call-template>                   
  				 </table>				
			</td></tr>
			<tr><td class="itmeouterbottom">&#160;</td><td width="99%">&#160;</td></tr>
		</table>
	 </xsl:template>


      <xsl:template match="REPORT_TEMPLATE">
		
		<table class="itemouter" width="100%" cellpadding="0" cellspacing="0">
			<tr><td class="itmeoutertop">&#160;</td><td width="99%">&#160;</td></tr>
			<tr><td colspan="2" align="left">
			
				<table width="100%" cellpadding="0" cellspacing="0">                    		
                    		<xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Report Template Name:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="@NAME"/></xsl:with-param>                          
                                  </xsl:call-template>     
                                  <xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Utilization:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="UTILIZATION"/></xsl:with-param>                          
                                  </xsl:call-template>  
                                  <xsl:call-template name="ITEM_DETAILS2">
                                 <xsl:with-param name="label">Subscription:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="SUBSCRIPTION"/></xsl:with-param>                          
                                  </xsl:call-template>                   					     
                    		<xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Template Type:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="ROW_TEMPLATE_TYPE"/></xsl:with-param>                          
                                  </xsl:call-template>										
					<xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Template:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="ROW_TEMPLATE1"/></xsl:with-param>                          
                                  </xsl:call-template>	
                                  <xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Declarative display condition:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="ROW_TEMPLATE_DISPLAY_COND1"/></xsl:with-param>                          
                                  </xsl:call-template>     
                                  <xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Used When:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="ROW_TEMPLATE_CONDITION1"/></xsl:with-param>                          
                                  </xsl:call-template>
                                  <xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Template 2:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="ROW_TEMPLATE2"/></xsl:with-param>                          
                                  </xsl:call-template>	
                                  <xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Declarative display condition 2:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="ROW_TEMPLATE_DISPLAY_COND2"/></xsl:with-param>                          
                                  </xsl:call-template>     
                                  <xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Used When 2:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="ROW_TEMPLATE_CONDITION2"/></xsl:with-param>                          
                                  </xsl:call-template>
                                 <xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Template 3:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="ROW_TEMPLATE3"/></xsl:with-param>                          
                                  </xsl:call-template>	
                                  <xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Declarative display condition 3:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="ROW_TEMPLATE_DISPLAY_COND3"/></xsl:with-param>                          
                                  </xsl:call-template>     
                                  <xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Used When 3:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="ROW_TEMPLATE_CONDITION3"/></xsl:with-param>                          
                                  </xsl:call-template>
                                 <xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Template 4:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="ROW_TEMPLATE4"/></xsl:with-param>                          
                                  </xsl:call-template>	
                                  <xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Declarative display condition 4:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="ROW_TEMPLATE_DISPLAY_COND4"/></xsl:with-param>                          
                                  </xsl:call-template>     
                                  <xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Used When 4:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="ROW_TEMPLATE_CONDITION4"/></xsl:with-param>                          
                                  </xsl:call-template>
                                  <xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Before Rows:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="ROW_TEMPLATE_BEFORE_ROWS"/></xsl:with-param>                          
                                  </xsl:call-template>
                                  <xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">After Rows:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="ROW_TEMPLATE_AFTER_ROWS"/></xsl:with-param>                          
                                  </xsl:call-template> 
                                  <xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Table Attributes:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="ROW_TEMPLATE_TABLE_ATTRIBUTES"/></xsl:with-param>                          
                                  </xsl:call-template>
                                 <xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Column Heading Template:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="COLUMN_HEADING_TEMPLATE"/></xsl:with-param>                          
                                  </xsl:call-template>
                                  <xsl:call-template name="ITEM_DETAILS">                                
                                 <xsl:with-param name="label">Template Comment:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="ROW_TEMPLATE_COMMENT"/></xsl:with-param>                          
                                  </xsl:call-template>		
                                  <xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Last Updated By:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="LAST_UPDATED_BY"/></xsl:with-param>                          
                                  </xsl:call-template>
                                 <xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Last Updated:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of select="LAST_UPDATED_BY"/> - <xsl:value-of select="LAST_UPDATED_ON"/></xsl:with-param>                                               
                                 </xsl:call-template>
  				 </table>				
			</td></tr>
			<tr><td class="itmeouterbottom">&#160;</td><td width="99%">&#160;</td></tr>
		</table>
	 </xsl:template>


       <xsl:template match="LIST_TEMPLATE">
		
		<table class="itemouter" width="100%" cellpadding="0" cellspacing="0">
			<tr><td class="itmeoutertop">&#160;</td><td width="99%">&#160;</td></tr>
			<tr><td colspan="2" align="left">
			
				<table width="100%" cellpadding="0" cellspacing="0">                    		
                    		<xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">List Template Name:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="@NAME"/></xsl:with-param>                          
                                  </xsl:call-template> 		
                                  <xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Utilization:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="UTILIZATION"/></xsl:with-param>                          
                                 </xsl:call-template>
                                  <xsl:call-template name="ITEM_DETAILS2">
                                 <xsl:with-param name="label">Subscription:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="SUBSCRIPTION"/></xsl:with-param>                          
                                  </xsl:call-template>     		
					<xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">List Template Current:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="LIST_TEMPLATE_CURRENT"/></xsl:with-param>                          
                                  </xsl:call-template>	
                                  <xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">List Template Noncurrent:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="LIST_TEMPLATE_NONCURRENT"/></xsl:with-param>                          
                                  </xsl:call-template>     
                                  <xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">List Template Before Rows:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="LIST_TEMPLATE_BEFORE_ROWS"/></xsl:with-param>                          
                                  </xsl:call-template>
                                  <xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">List Template After Rows:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="LIST_TEMPLATE_AFTER_ROWS"/></xsl:with-param>                          
                                  </xsl:call-template>                                  
                                  <xsl:call-template name="ITEM_DETAILS">                                
                                 <xsl:with-param name="label">Template Comment:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="LIST_TEMPLATE_COMMENT"/></xsl:with-param>                          
                                  </xsl:call-template>		
                                 <xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Last Updated:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of select="LAST_UPDATED_BY"/> - <xsl:value-of select="LAST_UPDATED_ON"/></xsl:with-param>                                               
                                 </xsl:call-template>
  				 </table>				
			</td></tr>
			<tr><td class="itmeouterbottom">&#160;</td><td width="99%">&#160;</td></tr>
		</table>
	 </xsl:template>


        <xsl:template match="FIELD_TEMPLATE">
		
		<table class="itemouter" width="100%" cellpadding="0" cellspacing="0">
			<tr><td class="itmeoutertop">&#160;</td><td width="99%">&#160;</td></tr>
			<tr><td colspan="2" align="left">
			
				<table width="100%" cellpadding="0" cellspacing="0">                    		
                    		<xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Label Template Name:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="@NAME"/></xsl:with-param>                          
                                  </xsl:call-template> 		
                                  <xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Utilization:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="UTILIZATION"/></xsl:with-param>                          
                                  </xsl:call-template>	
                                  <xsl:call-template name="ITEM_DETAILS2">
                                 <xsl:with-param name="label">Subscription:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="SUBSCRIPTION"/></xsl:with-param>                          
                                  </xsl:call-template>     	
					<xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Before Label :</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="TEMPLATE_BODY1"/></xsl:with-param>                          
                                  </xsl:call-template>	
                                  <xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">After Label :</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="TEMPLATE_BODY2"/></xsl:with-param>                          
                                  </xsl:call-template>     
                                  <xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">On Error Before Label :</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="ON_ERROR_BEFORE_LABEL"/></xsl:with-param>                          
                                  </xsl:call-template>
                                  <xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">On Error After Label :</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="ON_ERROR_AFTER_LABEL"/></xsl:with-param>                          
                                  </xsl:call-template>                                  
                                  <xsl:call-template name="ITEM_DETAILS">                                
                                 <xsl:with-param name="label">Template Comment:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="TEMPLATE_COMMENT"/></xsl:with-param>                          
                                  </xsl:call-template>		
                                 <xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Last Updated:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of select="LAST_UPDATED_BY"/> - <xsl:value-of select="LAST_UPDATED_ON"/></xsl:with-param>                                               
                                 </xsl:call-template>                                                              
  				 </table>				
			</td></tr>
			<tr><td class="itmeouterbottom">&#160;</td><td width="99%">&#160;</td></tr>
		</table>
	 </xsl:template>


       <xsl:template match="POPUP_LOV_TEMPLATE">
		
		<table class="itemouter" width="100%" cellpadding="0" cellspacing="0">
			<tr><td class="itmeoutertop">&#160;</td><td width="99%">&#160;</td></tr>
			<tr><td colspan="2" align="left">
			
				<table width="100%" cellpadding="0" cellspacing="0">                    		
                    		<xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Popup Lov Template ID:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="@ID"/></xsl:with-param>                          
                                  </xsl:call-template> 		
                                  <xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Popup Icon:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="POPUP_ICON"/></xsl:with-param>                          
                                  </xsl:call-template>	
                                  <xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Popup Icon Attr:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="POPUP_ICON_ATTR"/></xsl:with-param>                          
                                  </xsl:call-template>     	
					<xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Before Field Text:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="BEFORE_FIELD_TEXT"/></xsl:with-param>                          
                                  </xsl:call-template>	
                                  <xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Filter Width:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="FILTER_WIDTH"/></xsl:with-param>                          
                                  </xsl:call-template>     
                                  <xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Filter Max Width:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="FILTER_MAX_WIDTH"/></xsl:with-param>                          
                                  </xsl:call-template>
                                  <xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Filter Text Attributes:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="FILTER_TEXT_ATTR"/></xsl:with-param>                          
                                  </xsl:call-template>                                  
                                  <xsl:call-template name="ITEM_DETAILS">                                
                                 <xsl:with-param name="label">After Field Text:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="AFTER_FIELD_TEXT"/></xsl:with-param>                          
                                  </xsl:call-template>	
                                  <xsl:call-template name="ITEM_DETAILS">                                
                                 <xsl:with-param name="label">Find Button Text:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="FIND_BUTTON_TEXT"/></xsl:with-param>                          
                                  </xsl:call-template>		
                                 <xsl:call-template name="ITEM_DETAILS">                                
                                 <xsl:with-param name="label">Find Button Image:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="FIND_BUTTON_IMAGE"/></xsl:with-param>                          
                                  </xsl:call-template>		
                                 <xsl:call-template name="ITEM_DETAILS">                                
                                 <xsl:with-param name="label">Find Button Attr:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="FIND_BUTTON_ATTR"/></xsl:with-param>                          
                                  </xsl:call-template>		
                                 <xsl:call-template name="ITEM_DETAILS">                                
                                 <xsl:with-param name="label">Close Button Text:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="CLOSE_BUTTON_TEXT"/></xsl:with-param>                          
                                  </xsl:call-template>		
                                 <xsl:call-template name="ITEM_DETAILS">                                
                                 <xsl:with-param name="label">Close Button Image:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="CLOSE_BUTTON_IMAGE"/></xsl:with-param>                          
                                  </xsl:call-template>		
                                 <xsl:call-template name="ITEM_DETAILS">                                
                                 <xsl:with-param name="label">Close Button Attr:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="CLOSE_BUTTON_ATTR"/></xsl:with-param>                          
                                  </xsl:call-template>		
                                 <xsl:call-template name="ITEM_DETAILS">                                
                                 <xsl:with-param name="label">Next Button Text:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="NEXT_BUTTON_TEXT"/></xsl:with-param>                          
                                  </xsl:call-template>		
                                 <xsl:call-template name="ITEM_DETAILS">                                
                                 <xsl:with-param name="label">Next Button Image:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="NEXT_BUTTON_IMAGE"/></xsl:with-param>                          
                                  </xsl:call-template>		
                                 <xsl:call-template name="ITEM_DETAILS">                                
                                 <xsl:with-param name="label">Next Button Attr:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="NEXT_BUTTON_ATTR"/></xsl:with-param>                          
                                  </xsl:call-template>		
                                 <xsl:call-template name="ITEM_DETAILS">                                
                                 <xsl:with-param name="label">Prev Button Text:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="PREV_BUTTON_TEXT"/></xsl:with-param>                          
                                  </xsl:call-template>		
                                 <xsl:call-template name="ITEM_DETAILS">                                
                                 <xsl:with-param name="label">Prev Button Image:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="PREV_BUTTON_IMAGE"/></xsl:with-param>                          
                                  </xsl:call-template>		
                                 <xsl:call-template name="ITEM_DETAILS">                                
                                 <xsl:with-param name="label">Prev Button Attr:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="PREV_BUTTON_ATTR"/></xsl:with-param>                          
                                  </xsl:call-template>		
                                 <xsl:call-template name="ITEM_DETAILS">                                
                                 <xsl:with-param name="label">Scrollbars:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="SCROLLBARS"/></xsl:with-param>                          
                                  </xsl:call-template>		
                                 <xsl:call-template name="ITEM_DETAILS">                                
                                 <xsl:with-param name="label">Resizable:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="RESIZABLE"/></xsl:with-param>                          
                                  </xsl:call-template>		
                                 <xsl:call-template name="ITEM_DETAILS">                                
                                 <xsl:with-param name="label">Width:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="WIDTH"/></xsl:with-param>                          
                                  </xsl:call-template>		
                                 <xsl:call-template name="ITEM_DETAILS">                                
                                 <xsl:with-param name="label">Height:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="HEIGHT"/></xsl:with-param>                          
                                  </xsl:call-template>		
                                 <xsl:call-template name="ITEM_DETAILS">                                
                                 <xsl:with-param name="label">Result Row X Of Y:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="RESULT_ROW_X_OF_Y"/></xsl:with-param>                          
                                  </xsl:call-template>		
                                 <xsl:call-template name="ITEM_DETAILS">                                
                                 <xsl:with-param name="label">Result Rows Per Pg:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="RESULT_ROWS_PER_PG"/></xsl:with-param>                          
                                  </xsl:call-template>		
                                 <xsl:call-template name="ITEM_DETAILS">                                
                                 <xsl:with-param name="label">Page Name:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="PAGE_NAME"/></xsl:with-param>                          
                                  </xsl:call-template>		
                                 <xsl:call-template name="ITEM_DETAILS">                                
                                 <xsl:with-param name="label">Page Title:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="PAGE_TITLE"/></xsl:with-param>                          
                                  </xsl:call-template>		
                                 <xsl:call-template name="ITEM_DETAILS">                                
                                 <xsl:with-param name="label">Page Html Head:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="PAGE_HTML_HEAD"/></xsl:with-param>                          
                                  </xsl:call-template>		
                                 <xsl:call-template name="ITEM_DETAILS">                                
                                 <xsl:with-param name="label">Page Body Attributes:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="PAGE_BODY_ATTR"/></xsl:with-param>                          
                                  </xsl:call-template>		
                                 <xsl:call-template name="ITEM_DETAILS">                                
                                 <xsl:with-param name="label">Page Heading Text:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="PAGE_HEADING_TEXT"/></xsl:with-param>                          
                                  </xsl:call-template>		
                                 <xsl:call-template name="ITEM_DETAILS">                                
                                 <xsl:with-param name="label">Page Footer Text:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="PAGE_FOOTER_TEXT"/></xsl:with-param>                          
                                  </xsl:call-template>	
                                 <xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Last Updated:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of select="LAST_UPDATED_BY"/> - <xsl:value-of select="LAST_UPDATED_ON"/></xsl:with-param>                                               
                                 </xsl:call-template>                                                              
  				 </table>				
			</td></tr>
			<tr><td class="itmeouterbottom">&#160;</td><td width="99%">&#160;</td></tr>
		</table>
	 </xsl:template>


      <xsl:template match="MENU_TEMPLATE">
		
		<table class="itemouter" width="100%" cellpadding="0" cellspacing="0">
			<tr><td class="itmeoutertop">&#160;</td><td width="99%">&#160;</td></tr>
			<tr><td colspan="2" align="left">
			
				<table width="100%" cellpadding="0" cellspacing="0">                    		
                    		<xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Menu Template Name:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="@NAME"/></xsl:with-param>                          
                                  </xsl:call-template> 	
                                  <xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Utilization:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="UTILIZATION"/></xsl:with-param>                          
                                  </xsl:call-template>	
                                  <xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Start With:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="START_WITH_NODE"/></xsl:with-param>                          
                                  </xsl:call-template>	
                                  <xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Before First:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="BEFORE_FIRST"/></xsl:with-param>                          
                                  </xsl:call-template>     	
					<xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Current Page Menu Option:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="CURRENT_PAGE_OPTION"/></xsl:with-param>                          
                                  </xsl:call-template>	
                                  <xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Non Current Page Menu Option:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="NON_CURRENT_PAGE_OPTION"/></xsl:with-param>                          
                                  </xsl:call-template>  
                                  <xsl:call-template name="ITEM_DETAILS">                                
                                 <xsl:with-param name="label">After Last:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="AFTER_LAST"/></xsl:with-param>                          
                                  </xsl:call-template>   
                                  <xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Menu Link Attributes:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="MENU_LINK_ATTRIBUTES"/></xsl:with-param>                          
                                  </xsl:call-template>
                                  <xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Between Levels:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="BETWEEN_LEVELS"/></xsl:with-param>                          
                                  </xsl:call-template>   
                                  <xsl:call-template name="ITEM_DETAILS">                                
                                 <xsl:with-param name="label">Max Levels:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="MAX_LEVELS"/></xsl:with-param>                          
                                  </xsl:call-template>		
                                 <xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Last Updated:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of select="LAST_UPDATED_BY"/> - <xsl:value-of select="LAST_UPDATED_ON"/></xsl:with-param>                                               
                                 </xsl:call-template>                                                              
  				 </table>				
			</td></tr>
			<tr><td class="itmeouterbottom">&#160;</td><td width="99%">&#160;</td></tr>
		</table>
	 </xsl:template>



        <xsl:template match="SECURITY_SCHEME">
		
		<table class="itemouter" width="100%" cellpadding="0" cellspacing="0">
			<tr><td class="itmeoutertop">&#160;</td><td width="99%">&#160;</td></tr>
			<tr><td colspan="2" align="left">
			
				<table width="100%" cellpadding="0" cellspacing="0">                    		
                    		<xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Name:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="@NAME"/></xsl:with-param>                          
                                  </xsl:call-template> 	
                                  <xsl:call-template name="ITEM_DETAILS2">
                                 <xsl:with-param name="label">Subscription:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="SUBSCRIPTION"/></xsl:with-param>                          
                                  </xsl:call-template>  			
					<xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Scheme Type:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="SCHEME_TYPE"/></xsl:with-param>                          
                                  </xsl:call-template>	
                                  <xsl:call-template name="ITEM_CODE">
                                 <xsl:with-param name="label">Scheme Source :</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  disable-output-escaping="yes" select="SCHEME"/></xsl:with-param>                          
                                  </xsl:call-template>     
                                  <xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Scheme Text  :</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="SCHEME_TEXT"/></xsl:with-param>                          
                                  </xsl:call-template>
                                  <xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Error Message:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="ERROR_MESSAGE"/></xsl:with-param>                          
                                  </xsl:call-template>                                  
                                  <xsl:call-template name="ITEM_DETAILS">                                
                                 <xsl:with-param name="label">Validate security scheme:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="CACHING"/></xsl:with-param>                          
                                  </xsl:call-template>	
                                 <xsl:call-template name="ITEM_DETAILS">                                
                                 <xsl:with-param name="label">Comments:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select=" COMMENTS"/></xsl:with-param>                          
                                  </xsl:call-template>		
                                 <xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Last Updated:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of select="LAST_UPDATED_BY"/> - <xsl:value-of select="LAST_UPDATED_ON"/></xsl:with-param>                                               
                                 </xsl:call-template>
  				 </table>				
			</td></tr>
			<tr><td class="itmeouterbottom">&#160;</td><td width="99%">&#160;</td></tr>
		</table>
	 </xsl:template>


       <xsl:template match="BUILD_OPTION">
		
		<table class="itemouter" width="100%" cellpadding="0" cellspacing="0">
			<tr><td class="itmeoutertop">&#160;</td><td width="99%">&#160;</td></tr>
			<tr><td colspan="2" align="left">
			
				<table width="100%" cellpadding="0" cellspacing="0">                    		
                    		<xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Build Option Name:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="@NAME"/></xsl:with-param>                          
                                  </xsl:call-template> 				
					<xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Scheme Type:</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="PATCH_STATUS"/></xsl:with-param>                          
                                  </xsl:call-template>	
                                  <xsl:call-template name="ITEM_DETAILS">
                                 <xsl:with-param name="label">Comment :</xsl:with-param>
                                 <xsl:with-param name="value"><xsl:value-of  select="PATCH_COMMENT"/></xsl:with-param>                          
                                  </xsl:call-template>                                                                  
  				 </table>				
			</td></tr>
			<tr><td class="itmeouterbottom">&#160;</td><td width="99%">&#160;</td></tr>
		</table>
	 </xsl:template>
	 
	 
	 <xsl:template match="PAGE">
		<tr>
			<td class="summaryvalue2" nowrap="nowrap"><xsl:value-of select="@ID"/> - <xsl:value-of select="NAME"/></td>
			<td class="summaryvalue2" nowrap="nowrap"><xsl:value-of select="LAST_UPDATED_BY"/> - <xsl:value-of select="LAST_UPDATED_ON"/></td>
		</tr>
	</xsl:template>



<!-- GLOBAL TEMPLATE  GLOBAL TEMPLATE  GLOBAL TEMPLATE GLOBAL TEMPLATE   GLOBAL TEMPLATE   GLOBAL TEMPLATE   GLOBAL TEMPLATE   GLOBAL TEMPLATE   GLOBAL TEMPLATE  -->

	<xsl:template name="FLOW_DETAILS">
		<xsl:param name="label"/>
		<xsl:param name="value"/>
		<xsl:if test="string-length($value) &gt; 1">
			<tr>
			<td class="pagesubtitle1" nowrap="nowrap"><xsl:value-of select="$label"/></td><td class="pagesubtitle2"><xsl:value-of select="$value"/></td>
			</tr>
		</xsl:if>
	</xsl:template>
	
	<xsl:template name="ITEM_DETAILS">
		<xsl:param name="label"/>
		<xsl:param name="value"/>
		<xsl:if test="string-length($value) &gt; 0 and $value !=' - ' ">
		<tr><td class="itemlabel" nowrap="nowrap" valign="top"><xsl:value-of select="$label"/></td><td class="item"><xsl:value-of select="$value"/></td></tr>
		</xsl:if>
	</xsl:template>
	
	<xsl:template name="ITEM_DETAILS2">
		<xsl:param name="label"/>
		<xsl:param name="value"/>
		<xsl:if test="string-length($value) &gt; 0 and $value !=' - ' ">
		<tr><td class="itemlabel" nowrap="nowrap" valign="top"><xsl:value-of select="$label"/></td><td class="item" nowrap="wrap"><xsl:value-of disable-output-escaping="yes" select="$value"/></td></tr>
		</xsl:if>
	</xsl:template>

				
	<xsl:template name="ITEM_CODE">
		<xsl:param name="label"/>
		<xsl:param name="value"/>
		<tr>
		<td class="itemlabel" nowrap="nowrap" valign="top"><xsl:value-of select="$label"/></td><td class="code" nowrap="wrap"><xsl:value-of disable-output-escaping="yes" select="$value"/></td>
		</tr>	
	</xsl:template>


<!-- SECTION TEMPLATE SECTION TEMPLATE  SECTION TEMPLATE   SECTION TEMPLATE   SECTION TEMPLATE   SECTION TEMPLATE   SECTION TEMPLATE   SECTION TEMPLATE   SECTION TEMPLATE    -->
	<xsl:template name="ITEM_SECTION">	
	      <xsl:element name="div">
		<xsl:attribute name="id">item1</xsl:attribute>      
		<table width="100%" class="region" cellpadding="0" cellspacing="0" align="center">
			<tr>
				<td class="regiontitle" width="10%" nowrap="nowrap">
					<span class="regiontitletext">Flow Items</span>
				</td>						
			</tr>	
			<tr>
				<td colspan="2">				           
				           <xsl:if test="count(ITEMS/ITEM)=0">
				            <font class="fielddata">No item exists.</font>
				           </xsl:if>				           
				           <xsl:for-each select="ITEMS">					                 	
				                <xsl:apply-templates select="ITEM"/>					            
                                     </xsl:for-each>
				</td>
			</tr>		
		</table>		
		</xsl:element>
	</xsl:template>
	
	
	<xsl:template name="PROCESS_SECTION">
	      <xsl:element name="div">
		<xsl:attribute name="id">process1</xsl:attribute>
		<table width="100%" class="region" cellpadding="0" cellspacing="0" align="center">
			<tr>
				<td class="regiontitle" width="10%" nowrap="nowrap">
					<span class="regiontitletext">Flow Processes</span>
				</td>						
			</tr>	
			<tr>
				<td colspan="2">	
				  <xsl:if test="count(PROCESSES/PROCESS)=0">
				   <font class="fielddata">No process exists.</font>
				  </xsl:if>				          				    
				  <xsl:for-each select="PROCESSES">				             				    
				       <xsl:apply-templates select="PROCESS"/>
                            </xsl:for-each>			    								    
				</td>
			</tr>		
		</table>
		</xsl:element>
	</xsl:template>
	
	<xsl:template name="COMPUTATION_SECTION">
	      <xsl:element name="div">
		<xsl:attribute name="id">computation1</xsl:attribute>
		<table width="100%" class="region" cellpadding="0" cellspacing="0" align="center">
			<tr>
				<td class="regiontitle" width="10%" nowrap="nowrap">
					<span class="regiontitletext">Flow Computations</span>
				</td>						
			</tr>	
			<tr>
				<td colspan="2">	
				             <xsl:if test="count(COMPUTATIONS/COMPUTATION)=0">
				              <font class="fielddata">No computation exists.</font>
				             </xsl:if>	
				             <xsl:for-each select="COMPUTATIONS">				             				    
				                  <xsl:apply-templates select="COMPUTATION"/>	
                                        </xsl:for-each>			    								    
				</td>
			</tr>		
		</table>
		</xsl:element>
	</xsl:template>
	
	<xsl:template name="NAVBAR_SECTION">
	      <xsl:element name="div">
		<xsl:attribute name="id">navbar1</xsl:attribute>
		<table width="100%" class="region" cellpadding="0" cellspacing="0" align="center">
			<tr>
				<td class="regiontitle" width="10%" nowrap="nowrap">
					<span class="regiontitletext">NavBars</span>
				</td>						
			</tr>	
			<tr>
				<td colspan="2">	
						<xsl:if test="count(NAVBARS/NAVBAR)=0">
				              <font class="fielddata">No NavBar exists.</font>
				             </xsl:if>	
			          				    
				             <xsl:for-each select="NAVBARS">				             				    
				                  <xsl:apply-templates select="NAVBAR"/>	
                                        </xsl:for-each>			    								    
				</td>
			</tr>		
		</table>
		</xsl:element>
	</xsl:template>

      <xsl:template name="PARENT_TAB_SECTION">
             <xsl:element name="div">
		<xsl:attribute name="id">tab1</xsl:attribute>
		<table width="100%" class="region" cellpadding="0" cellspacing="0" align="center">
			<tr>
				<td class="regiontitle" width="10%" nowrap="nowrap">
					<span class="regiontitletext">Parent Tabs</span>
				</td>						
			</tr>	
			<tr>
				<td colspan="2">	
						<xsl:if test="count(PARENT_TABS/PARENT_TAB)=0">
				              <font class="fielddata">No parent tab exists.</font>
				             </xsl:if>	
			          				    
				             <xsl:for-each select="PARENT_TABS">				             				    
				                  <xsl:apply-templates select="PARENT_TAB"/>	
                                        </xsl:for-each>			    								    
				</td>
			</tr>		
		</table>
		</xsl:element>
	</xsl:template>
	
	<xsl:template name="STANDARD_TAB_SECTION">
	      <xsl:element name="div">
		<xsl:attribute name="id">tab2</xsl:attribute>
		<table width="100%" class="region" cellpadding="0" cellspacing="0" align="center">
			<tr>
				<td class="regiontitle" width="10%" nowrap="nowrap">
					<span class="regiontitletext">Standard Tabs</span>
				</td>						
			</tr>	
			<tr>
				<td colspan="2">		
						<xsl:if test="count(STANDARD_TABS/STANDARD_TAB)=0">
				              <font class="fielddata">No standard tab exists.</font>
				             </xsl:if>	
		          				    
				             <xsl:for-each select="STANDARD_TABS">				             				    
				                  <xsl:apply-templates select="STANDARD_TAB"/>	
                                        </xsl:for-each>			    								    
				</td>
			</tr>		
		</table>
		</xsl:element>
	</xsl:template>
	
	<xsl:template name="APPLICATION_TAB_SECTION">
	       <xsl:element name="div">
		<xsl:attribute name="id">tab3</xsl:attribute>
		<table width="100%" class="region" cellpadding="0" cellspacing="0" align="center">
			<tr>
				<td class="regiontitle" width="10%" nowrap="nowrap">
					<span class="regiontitletext">Application Tabs</span>
				</td>						
			</tr>	
			<tr>
				<td colspan="2">		
						<xsl:if test="count(APPLICATION_TABS/APPLICATION_TAB)=0">
				             <font class="fielddata">No application tab exists.</font>
				             </xsl:if>	
		          				    
				             <xsl:for-each select="APPLICATION_TABS">				             				    
				                  <xsl:apply-templates select="APPLICATION_TAB"/>	
                                        </xsl:for-each>			    								    
				</td>
			</tr>		
		</table>
		</xsl:element>
	</xsl:template>

	
	<xsl:template name="LOV_SECTION">
	       <xsl:element name="div">
		<xsl:attribute name="id">lov1</xsl:attribute>
		<table width="100%" class="region" cellpadding="0" cellspacing="0" align="center">
			<tr>
				<td class="regiontitle" width="10%" nowrap="nowrap">
					<span class="regiontitletext">List of Values</span>
				</td>						
			</tr>	
			<tr>
				<td>         	
						<xsl:if test="count(LOVS/LOV)=0">
				             <font class="fielddata">No LOV exists.</font>
				             </xsl:if>	
			    
				             <xsl:for-each select="LOVS">				             				    
				                  <xsl:apply-templates select="LOV"/>	
                                        </xsl:for-each>			    								    
				</td>
			</tr>		
		</table>
		</xsl:element>
	</xsl:template>
	
	
	<xsl:template name="TREE_SECTION">
	       <xsl:element name="div">
		<xsl:attribute name="id">tree1</xsl:attribute>
		<table width="100%" class="region" cellpadding="0" cellspacing="0" align="center">
			<tr>
				<td class="regiontitle" width="10%" nowrap="nowrap">
					<span class="regiontitletext">Trees</span>
				</td>						
			</tr>	
			<tr>
				<td colspan="2">
						<xsl:if test="count(TREES/TREE)=0">
				             <font class="fielddata">No Tree exists.</font>
				             </xsl:if>	
				          				    
				             <xsl:for-each select="TREES">				             				    
				                  <xsl:apply-templates select="TREE"/>	
                                        </xsl:for-each>			    								    
				</td>
			</tr>		
		</table>
		</xsl:element>
	</xsl:template>
	
	
	<xsl:template name="LIST_SECTION">
	       <xsl:element name="div">
		<xsl:attribute name="id">list1</xsl:attribute>
		<table width="100%" class="region" cellpadding="0" cellspacing="0" align="center">
			<tr>
				<td class="regiontitle" width="10%" nowrap="nowrap">
					<span class="regiontitletext">Lists</span>
				</td>						
			</tr>	
			<tr>
				<td colspan="2">				          				    
						<xsl:if test="count(LISTS/LIST)=0">
				                <font class="fielddata">No list exists.</font>
				           </xsl:if>	

				            <xsl:for-each select="LISTS">				             				    
				                 <xsl:apply-templates select="LIST"/>					                 				                   
                                 </xsl:for-each>			    								    
				</td>
			</tr>		
		</table>
		</xsl:element>
	</xsl:template>
	
	
	<xsl:template name="MENU_SECTION">
	       <xsl:element name="div">
		<xsl:attribute name="id">menu1</xsl:attribute>
		<table width="100%" class="region" cellpadding="0" cellspacing="0" align="center">
			<tr>
				<td class="regiontitle" width="10%" nowrap="nowrap">
					<span class="regiontitletext">Menus</span>
				</td>						
			</tr>	
			<tr>
				<td colspan="2">				          				    
						<xsl:if test="count(MENUS/MENU)=0">
				                <font class="fielddata">No menu exists.</font>
				           </xsl:if>	

				            <xsl:for-each select="MENUS">				             				    
				                 <xsl:apply-templates select="MENU"/>					                 				                   
                                 </xsl:for-each>			    								    
				</td>
			</tr>		
		</table>
		</xsl:element>
	</xsl:template>

	
			
	<xsl:template name="SHORTCUT_SECTION">
	       <xsl:element name="div">
		<xsl:attribute name="id">shortcut1</xsl:attribute>
		<table width="100%" class="region" cellpadding="0" cellspacing="0" align="center">
			<tr>
				<td class="regiontitle" width="10%" nowrap="nowrap">
					<span class="regiontitletext">Shortcuts</span>
				</td>						
			</tr>	
			<tr>
				<td colspan="2">				          				    
						<xsl:if test="count(SHORTCUTS/SHORTCUT)=0">
				              <font class="fielddata">No shortcut exists.</font>
				             </xsl:if>	

				             <xsl:for-each select="SHORTCUTS">				             				    
				                  <xsl:apply-templates select="SHORTCUT"/>					                 				                     
                                        </xsl:for-each>			    								    
				</td>
			</tr>		
		</table>
		</xsl:element>
	</xsl:template>


      <xsl:template name="PAGE_TEMPLATE_SECTION">
             <xsl:element name="div">
		<xsl:attribute name="id">template1</xsl:attribute>
		<table width="100%" class="region" cellpadding="0" cellspacing="0" align="center">
			<tr>
				<td class="regiontitle" width="10%" nowrap="nowrap">
					<span class="regiontitletext">Page Templates</span>
				</td>						
			</tr>	
			<tr>
				<td colspan="2">		
						<xsl:if test="count(PAGE_TEMPLATES/PAGE_TEMPLATE)=0">
				              <font class="fielddata">No page template exists.</font>
				             </xsl:if>	
		          				    
				             <xsl:for-each select="PAGE_TEMPLATES">				             				    
				                  <xsl:apply-templates select="PAGE_TEMPLATE"/>					                 				                     
                                  </xsl:for-each>			    								    
				</td>
			</tr>		
		</table>
		</xsl:element>
	</xsl:template>
	
       <xsl:template name="REGION_TEMPLATE_SECTION">
              <xsl:element name="div">
		<xsl:attribute name="id">template2</xsl:attribute>
		<table width="100%" class="region" cellpadding="0" cellspacing="0" align="center">
			<tr>
				<td class="regiontitle" width="10%" nowrap="nowrap">
					<span class="regiontitletext">Region Templates</span>
				</td>						
			</tr>	
			<tr>
				<td colspan="2">		
						<xsl:if test="count(REGION_TEMPLATES/REGION_TEMPLATE)=0">
				              <font class="fielddata">No region template exists.</font>
				             </xsl:if>	
		          				    
				             <xsl:for-each select="REGION_TEMPLATES">				             				    
				                  <xsl:apply-templates select="REGION_TEMPLATE"/>					                 				                     
                                        </xsl:for-each>			    								    
				</td>
			</tr>		
		</table>
		</xsl:element>
	</xsl:template>
	
	
	<xsl:template name="REPORT_TEMPLATE_SECTION">
	       <xsl:element name="div">
		<xsl:attribute name="id">template3</xsl:attribute>
		<table width="100%" class="region" cellpadding="0" cellspacing="0" align="center">
			<tr>
				<td class="regiontitle" width="10%" nowrap="nowrap">
					<span class="regiontitletext">Report Templates</span>
				</td>						
			</tr>	
			<tr>
				<td colspan="2">	
						<xsl:if test="count(REPORT_TEMPLATES/REPORT_TEMPLATE)=0">
				              <font class="fielddata">No report template exists.</font>
				             </xsl:if>	
			          				    
				             <xsl:for-each select="REPORT_TEMPLATES">				             				    
				                  <xsl:apply-templates select="REPORT_TEMPLATE"/>					                 				                     
                                        </xsl:for-each>			    								    
				</td>
			</tr>		
		</table>
		</xsl:element>
	</xsl:template>
	
	<xsl:template name="LIST_TEMPLATE_SECTION">
	       <xsl:element name="div">
		<xsl:attribute name="id">template4</xsl:attribute>
		<table width="100%" class="region" cellpadding="0" cellspacing="0" align="center">
			<tr>
				<td class="regiontitle" width="10%" nowrap="nowrap">
					<span class="regiontitletext">List Templates</span>
				</td>						
			</tr>	
			<tr>
				<td colspan="2">		
					      <xsl:if test="count(LIST_TEMPLATES/LIST_TEMPLATE)=0">
				              <font class="fielddata">No list template exists.</font>
				             </xsl:if>	
		          				    
				             <xsl:for-each select="LIST_TEMPLATES">				             				    
				                  <xsl:apply-templates select="LIST_TEMPLATE"/>					                 				                     
                                        </xsl:for-each>			    								    
				</td>
			</tr>		
		</table>
		</xsl:element>
	</xsl:template>

      <xsl:template name="FIELD_TEMPLATE_SECTION">
             <xsl:element name="div">
		<xsl:attribute name="id">template5</xsl:attribute>
		<table width="100%" class="region" cellpadding="0" cellspacing="0" align="center">
			<tr>
				<td class="regiontitle" width="10%" nowrap="nowrap">
					<span class="regiontitletext">Label Templates</span>
				</td>						
			</tr>	
			<tr>
				<td colspan="2">		
						<xsl:if test="count(FIELD_TEMPLATES/FIELD_TEMPLATE)=0">
				              <font class="fielddata">No field template exists.</font>
				             </xsl:if>	
		          				    
				             <xsl:for-each select="FIELD_TEMPLATES">				             				    
				                  <xsl:apply-templates select="FIELD_TEMPLATE"/>					                 				                     
                                        </xsl:for-each>			    								    
				</td>
			</tr>		
		</table>
		</xsl:element>
	</xsl:template>
	
	
	<xsl:template name="POPUP_LOV_TEMPLATE_SECTION">
             <xsl:element name="div">
		<xsl:attribute name="id">template6</xsl:attribute>
		<table width="100%" class="region" cellpadding="0" cellspacing="0" align="center">
			<tr>
				<td class="regiontitle" width="10%" nowrap="nowrap">
					<span class="regiontitletext">Popup LOV Templates</span>
				</td>						
			</tr>	
			<tr>
				<td colspan="2">		
						<xsl:if test="count(POPUP_LOV_TEMPLATES/POPUP_LOV_TEMPLATE)=0">
				              <font class="fielddata">No popup lov template exists.</font>
				             </xsl:if>	
		          				    
				             <xsl:for-each select="POPUP_LOV_TEMPLATES">				             				    
				                  <xsl:apply-templates select="POPUP_LOV_TEMPLATE"/>					                 				                     
                                        </xsl:for-each>			    								    
				</td>
			</tr>		
		</table>
		</xsl:element>
	</xsl:template>
	
	
	<xsl:template name="MENU_TEMPLATE_SECTION">
             <xsl:element name="div">
		<xsl:attribute name="id">template7</xsl:attribute>
		<table width="100%" class="region" cellpadding="0" cellspacing="0" align="center">
			<tr>
				<td class="regiontitle" width="10%" nowrap="nowrap">
					<span class="regiontitletext">Menu Templates</span>
				</td>						
			</tr>	
			<tr>
				<td colspan="2">		
						<xsl:if test="count(MENU_TEMPLATES/MENU_TEMPLATE)=0">
				              <font class="fielddata">No menu template exists.</font>
				             </xsl:if>	
		          				    
				             <xsl:for-each select="MENU_TEMPLATES">				             				    
				                  <xsl:apply-templates select="MENU_TEMPLATE"/>					                 				                     
                                        </xsl:for-each>			    								    
				</td>
			</tr>		
		</table>
		</xsl:element>
	</xsl:template>
	
	
	<xsl:template name="SECURITY_SCHEME_SECTION">
	       <xsl:element name="div">
		<xsl:attribute name="id">securityscheme1</xsl:attribute>
		<table width="100%" class="region" cellpadding="0" cellspacing="0" align="center">
			<tr>
				<td class="regiontitle" width="10%" nowrap="nowrap">
					<span class="regiontitletext">Security Schemes</span>
				</td>						
			</tr>	
			<tr>
				<td colspan="2">	
						<xsl:if test="count(SECURITY_SCHEMES/SECURITY_SCHEME)=0">
				              <font class="fielddata">No security scheme exists.</font>
				             </xsl:if>	
			          				    
				             <xsl:for-each select="SECURITY_SCHEMES">				             				    
				                  <xsl:apply-templates select="SECURITY_SCHEME"/>					                 				                     
                                        </xsl:for-each>			    								    
				</td>
			</tr>		
		</table>
		</xsl:element>
	</xsl:template>
	
	<xsl:template name="BUILD_OPTION_SECTION">
	       <xsl:element name="div">
		<xsl:attribute name="id">buildoption1</xsl:attribute>
		<table width="100%" class="region" cellpadding="0" cellspacing="0" align="center">
			<tr>
				<td class="regiontitle" width="10%" nowrap="nowrap">
					<span class="regiontitletext">Build Options</span>
				</td>						
			</tr>	
			<tr>
				<td colspan="2">	
						<xsl:if test="count(BUILD_OPTIONS/BUILD_OPTION)=0">
				              <font class="fielddata">No build option exists.</font>
				             </xsl:if>	
			          				    
				             <xsl:for-each select="BUILD_OPTIONS">				             				    
				                  <xsl:apply-templates select="BUILD_OPTION"/>					                 				                     
                                        </xsl:for-each>			    								    
				</td>
			</tr>		
		</table>
		</xsl:element>
	</xsl:template>
	
	
	<xsl:template name="PAGE_SUMMARY_SECTION">
	      <xsl:element name="div">
	     <xsl:attribute name="id">pagesummary1</xsl:attribute>
	     <table class="summary" cellpadding="0" cellspacing="0" align="center">
		    <tr>
			   <td style="background-color: #eeeeee; border-bottom: 1px #aaaaaa solid; padding: 2px; color:#666666; font-size:10pt; font-weight:bold;" nowrap="nowrap" colspan="7">
							Pages
			   </td>
		    </tr>		   
		  <tr>
		  <td class="summarytitle2">Page</td>
		  <td class="summarytitle2">Updated</td>
		  </tr>
		  <xsl:for-each select="PAGES">
		       <xsl:apply-templates select="PAGE"/>
		  </xsl:for-each>
		</table>
		</xsl:element>
	</xsl:template>




	
</xsl:stylesheet>

				