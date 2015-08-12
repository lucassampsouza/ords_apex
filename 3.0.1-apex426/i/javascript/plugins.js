//Display download plugin message
var translate_string= false;
function noPlugin(tDiv){
	var divTag   = document.getElementsByTagName('DIV');
  for (var i=0;i < divTag.length;i++){
    if(divTag[i].id == 'svgRegion'){ /* fix for older apps id's*/
      divTag[i].id = null;
      divTag[i].className = 'svgRegion';
    }
    if(divTag[i].className && divTag[i].className == 'svgRegion'){
      if(translate_string){
        divTag[i].innerHTML = translate_string;
      }else{
        divTag[i].innerHTML = "Please install SVG Viewer to view the chart.  <a href='http://www.adobe.com/svg/viewer/install/main.html'>Click here to download.</a>";
      }
    }
  }
  return;
}
/**
 * Detect the following plugin:
 * Flash
 * Windows Media Player
 * Java
 * Shockwave
 * RealPlayer
 * QuickTime
 * Acrobat Reader
 * SVG Viewer
*/
function detectPlugin(){
	var agt = navigator.userAgent.toLowerCase();
	var ie  = (agt.indexOf("msie") != -1);
	var mo  = (navigator.appName.indexOf("Mozilla") != -1);
	var ns  = (navigator.appName.indexOf("Netscape") != -1);
	var win = ((agt.indexOf("win")!=-1) || (agt.indexOf("32bit")!=-1));
	var mac = (agt.indexOf("mac")!=-1);
	var mimetest = false;
	if (ie && win) {	pluginlist = detectIE("Adobe.SVGCtl","SVG Viewer") + detectIE("SWCtl.SWCtl.1","Shockwave Director") + detectIE("ShockwaveFlash.ShockwaveFlash.1","Shockwave Flash") + detectIE("rmocx.RealPlayer G2 Control.1","RealPlayer") + detectIE("QuickTimeCheckObject.QuickTimeCheck.1","QuickTime") + detectIE("MediaPlayer.MediaPlayer.1","Windows Media Player") + detectIE("PDF.PdfCtrl.5","Acrobat Reader"); }
	if (ns || mo || !win) {
		nse = ""; for (var i=0;i<navigator.mimeTypes.length;i++) nse += navigator.mimeTypes[i].type.toLowerCase();
		pluginlist = detectNS("image/svg+xml","SVG Viewer") + detectNS("application/x-director","Shockwave Director") + detectNS("application/x-shockwave-flash","Shockwave Flash") + detectNS("audio/x-pn-realaudio-plugin","RealPlayer") + detectNS("video/quicktime","QuickTime") + detectNS("application/x-mplayer2","Windows Media Player") + detectNS("application/pdf","Acrobat Reader");
	}
	function detectIE(ClassID,name) { result = false; document.write('<SCRIPT LANGUAGE=VBScript>\n on error resume next \n result = IsObject(CreateObject("' + ClassID + '"))</SCRIPT>\n'); if (result) return name+','; else return ''; }
	function detectNS(ClassID,name) { n = ""; if (nse.indexOf(ClassID) != -1) if (navigator.mimeTypes[ClassID].enabledPlugin != null) n = name+","; return n; }
	pluginlist += navigator.javaEnabled() ? "Java," : "";
	if (pluginlist.length > 0) {pluginlist = pluginlist.substring(0,pluginlist.length-1);}
	/* check for browsers with native rendering native browser tests*/
	if (navigator.mimeTypes != null&& navigator.mimeTypes.length > 0){if (navigator.mimeTypes["image/svg+xml"] != null){mimetest = true;}}
	//detect "SVG Viewer"
	if (pluginlist.indexOf("SVG Viewer")==-1 && !mimetest) {noPlugin('svgRegion');}
} // End detectPlugin()

//call detect plugin
detectPlugin();
