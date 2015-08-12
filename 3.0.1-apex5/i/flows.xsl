<?xml version="1.0"?>
<xsl:stylesheet version="1.0"
xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<xsl:template match="/">

  <html>
  <head>
    <link rel="stylesheet" href="/i/platform2.css" type="text/css"></link>
  </head>  
  <body>

  <table border="0" cellpadding="1" cellspacing="0" width="100%">
  <tr>
  <td bgcolor="#000000">
    <table border="0" cellpadding="4" cellspacing="0" width="100%" class="tableheader" >
      <tr>
        <td>
          <font color="#336699" size="2">
            <b>View Application</b>
          </font>
        </td>
        <td align="right">
          <input type="BUTTON" value="Return to Flows" onClick="javascript:history.go(-1);" class="button10"/>
        </td>
      </tr>
    </table>  
  </td>
  </tr>  
  </table> 

    <xsl:for-each select="APPLICATION/FLOWS">
      
      <xsl:apply-templates select="FLOW"/>
      
      <dir>
      
      <xsl:for-each select="PAGES">

        <dir>
        <table border="0" width="90%" cellspacing="1" cellpadding="4" bgcolor="#cccc99">
        <tr><td bgcolor="6699CC">
        <xsl:apply-templates select="PAGE"/>
        </td>
        </tr>
        <tr><td class="fielddata" bgcolor="#ffffff">
          <xsl:for-each select="REGIONS">  

          <table border="0" width="90%" cellspacing="1" cellpadding="4" bgcolor="#cccc99">
          
            <xsl:apply-templates select="REGION"/>
            <dir>
              <tr><td class="fielddata" bgcolor="#f7f7e7">
              <b>Items</b><hr align="left" width="50%" size="1"/>
              <table>
                <xsl:apply-templates select="PAGE_ITEM"/>          
              </table>  
             <b>Buttons</b><hr align="left" width="50%" size="1"/>
              <xsl:apply-templates select="BUTTON"/><br/>          
              </td></tr>
            </dir>  

          </table> 
          <br/>

          </xsl:for-each>
        
        </td></tr>
        </table>
        </dir>
        <br/>
        
      </xsl:for-each>
    
      </dir>
      
    </xsl:for-each>
    
  </body>
  </html>
  
</xsl:template>

<xsl:template match="FLOW">
  <table border="0">
    <tr><td class="header">
      Flow: <xsl:value-of select="@ID"/> - <xsl:value-of select="NAME"/>
      <hr align="left" width="600" size="1"></hr>
    </td></tr>  
    <tr><td class="fielddata">
      <xsl:value-of select="DOCUMENTATION_BANNER"/>
    </td></tr>  
  </table>  
</xsl:template>

<xsl:template match="PAGE">
   <span class="regionheader">page: <xsl:value-of select="@ID"/> - <xsl:value-of select="NAME"/></span>
   <br/><span class="smwhite"><xsl:value-of select="PAGE_COMMENT"/></span>
</xsl:template>

<xsl:template match="REGION">
  <tr><td class="fielddata" bgcolor="#cccc99">
    <b>Region: <xsl:value-of select="PLUG_NAME"/></b><font size="1"> (<xsl:value-of select="PLUG_SOURCE_TYPE"/>)</font>
  </td></tr>  
</xsl:template>

<xsl:template match="PAGE_ITEM">
  <tr>
  <td class="xsmblack"><xsl:value-of select="NAME"/></td>
  <!--<td class="xsmblack"><xsl:value-of select="PROMPT"/></td>//-->
  <td class="xsmblack"><xsl:value-of select="DISPLAY_AS"/></td>
  </tr>
</xsl:template>

<xsl:template match="BUTTON">
  <span class="xsmblack"><xsl:value-of select="BUTTON_NAME"/></span><br/>
</xsl:template>

</xsl:stylesheet> 
