/**
 * @fileOverview
 * The {@link apex.widget}.ckeditor4 is used for the Rich Text Editor widget of Oracle Application Express.
 * Internally the CKEditor http://www.ckeditor.com is used.
 * See the CKEditor documentation for available options.
 **/
/*global apex, CKEDITOR */
(function( widget, $ ) {

/**
 * @param {String} pSelector  jQuery selector to identify APEX page item(s) for this widget.
 * @param {Object} [pOptions]
 *
 * @function ckeditor4
 * @memberOf apex.widget
 * */
widget.ckeditor4 = function(pSelector, pOptions) {

  // Based on our custom settings, add addition properties to the autocomplete options
  var lOptions = $.extend({
                   toolbar: "Basic",
                   toolbarStartupExpanded: true,
                   disableNativeSpellChecker: false,
                   "menu_groups": "clipboard,tablecell,tablecellproperties,tablerow,tablecolumn,table,anchor,link,image,flash"
                   }, pOptions);

  // Get min width for the HTML Editor
  var lMinWidth = 0;
  if (lOptions.toolbar==="Basic") {
    if (lOptions.skin==="kama") {
      lMinWidth = lOptions.toolbarStartupExpanded?185:205;
    } else if (lOptions.skin==="moono" || lOptions.skin==="moonocolor") {
      lMinWidth = lOptions.toolbarStartupExpanded?181:201;
    } 
  } else if (lOptions.toolbar==="Intermediate") {
    if (lOptions.skin==="kama") {
      lMinWidth = lOptions.toolbarStartupExpanded?240:260;
    } else if (lOptions.skin==="moono" || lOptions.skin==="moonocolor") {
      lMinWidth = lOptions.toolbarStartupExpanded?235:255;
    } 
  } else if (lOptions.toolbar==="Full") {
    if (lOptions.skin==="kama") {
      lMinWidth = lOptions.toolbarStartupExpanded?530:530;
    } else if (lOptions.skin==="moono" || lOptions.skin==="moonocolor") {
      lMinWidth = lOptions.toolbarStartupExpanded?590:605;
    } 
  }

  // Get editor padding
  var lEditorPadding = (lOptions.skin==="kama"?25:20);

  // We don't want to show all toolbar entries of basic and full
  if (lOptions.toolbar==="Basic") {
    lOptions.toolbar = [['Bold', 'Italic', '-', 'RemoveFormat', '-', 'NumberedList', 'BulletedList', '-', 'Link', 'Unlink' , '-', 'Undo', 'Redo']];
  } else if (lOptions.toolbar==="Intermediate") {
    lOptions.toolbar = [
             ['Cut','Copy','Paste','-','Bold', 'Italic','Underline', '-', 'RemoveFormat', '-', 'NumberedList', 'BulletedList','-','Outdent','Indent', '-', 'Link', 'Unlink','Anchor' , '-', 'Undo', 'Redo'],
                         '/',
             ['Format','Font','FontSize','TextColor','-','JustifyLeft','JustifyCenter','JustifyRight']
                   ];
  } else if (lOptions.toolbar==="Full") {
    lOptions.toolbar = [
             ['Cut','Copy','Paste','PasteText','PasteFromWord','-','Print','Preview' , '-', 'Undo', 'Redo'],
             ['Templates'],
             ['Link','Unlink','Anchor'],
             ['Image','Table','HorizontalRule','Smiley','SpecialChar','PageBreak'],
             '/',
             ['Bold','Italic','Underline','Strike','-','Subscript','Superscript','-', 'RemoveFormat'],
             ['NumberedList','BulletedList','-','Outdent','Indent','Blockquote'],
             ['JustifyLeft','JustifyCenter','JustifyRight','JustifyBlock'],
             ['TextColor','BGColor'],
             ['ShowBlocks'],
             '/',
             ['Styles','Format','Font','FontSize'],
             [/*'Maximize',*/ 'Source']
           ];
                      
  }

  // No user will hide the toolbar if it's already displayed at startup
  if (lOptions.toolbarStartupExpanded) {
    lOptions.toolbarCanCollapse = false;
  } else {
    lOptions.toolbarCanCollapse = true;
  }
  //option to include resize in both directions.
  lOptions.resize_dir = 'both';
  //option to remove HTML tag hirearchy
  lOptions.removePlugins = 'elementspath,image';
  lOptions.extraPlugins = 'image2';

  // Instanciate the CKeditor
  $(pSelector, apex.gPageContext$).each (function() {
    var lFinalOptions = lOptions,
        self = this;
    // calculate the editor size depending on the textarea settings
    lFinalOptions.height = (this.rows*15)+lEditorPadding;
    lFinalOptions.width  = (this.cols*9.5 < lMinWidth)?lMinWidth:this.cols*9.5;
    lFinalOptions.resize_minHeight = lFinalOptions.height;
    lFinalOptions.resize_minWidth  = lFinalOptions.width;
    lFinalOptions.title            = apex.lang.formatMessage( "APEX.RICH_TEXT_EDITOR.ACCESSIBLE_LABEL", lOptions.label || "" );

    $(this).wrap("<div id='" + this.id + "_DISPLAY'></div>");

    CKEDITOR.replace(this.id, lFinalOptions);
    // For item help accessibility. See code in theme.js
    // Because ckeditor uses an iframe keyboard events don't pass up to this document
    // so handle the ckeditor key event and pass it on as a fake keydown event
    CKEDITOR.instances[this.id].on( "key", function ( event ) {
      if ( event.data.keyCode === CKEDITOR.ALT + 112 ) { // Alt + F1
          // fake a keydown event so that item help keyboard accessibility will work
          $( "#" + self.id ).trigger( $.Event("keydown", {
              altKey: true,
              ctrlKey: false,
              shiftKey: false,
              metaKey: false,
              isChar: false,
              which: 112,
              keyCode: 112
          }) );
      }
    });

    // Use blur event handler to simulate change behaviour, so that DA's and JS code triggers on change successfully.
    // Note: There is native support for change with CKEditor (since 4.2), however this triggers too frequently for our
    // usage, on every change without the user leaving the editor. We want the change behaviour to be more similar to
    // standard change behaviour on a textarea, where it triggers when the user leaves the field, if the value has changed.
    CKEDITOR.instances[this.id].on( "blur", function ( event ) {
      if ( CKEDITOR.instances[self.id].checkDirty() ) {
        $( "#" + self.id ).trigger( "change" );
        CKEDITOR.instances[self.id].resetDirty();
      }
    });

    // Register apex.item callbacks
    widget.initPageItem(this.id, {
        enable      : function() {
            alert('Enable not supported.');
        },
        disable     : function() {
            alert('Disable not supported.');
        },
        setValue    : function(pValue) {
            var oEditor = CKEDITOR.instances[this.id];
            oEditor.setData(pValue);
        },
        getValue    : function() {
            var oEditor = CKEDITOR.instances[this.id];
            return oEditor.getData();
        },
        setFocusTo  : function() {
            var oEditor = CKEDITOR.instances[this.id];
            oEditor.focus();
            // return fake object with focus method to keep caller happy
            return {focus:function(){}};
        }
    });
  });

  // register focus handling, so when the non-displayed textarea of the CKEditor
  // receives focus, focus is moved to the editor.
  $(pSelector, apex.gPageContext$).focus(function(){
    var oEditor = CKEDITOR.instances[this.id];
    oEditor.focus();
  });

    $( )

}; // ckeditor4

})( apex.widget, apex.jQuery );
