<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:fo="http://www.w3.org/1999/XSL/Format">
<xsl:output method="xml" indent="yes"/>
	<xsl:template match="/">
			<html>
			<head>
				<link rel="stylesheet" href="/i/xml/xml_pages.css" type="text/css"/>
				<title>Page: <xsl:value-of select="PAGES/PAGE/@ID"/> - <xsl:value-of select="substring(PAGES/PAGE/NAME,1,100)"/></title>
				<script type="text/javascript">
				<xsl:text disable-output-escaping="yes">
				<![CDATA[			
						function vis(obj,objlink) {
						  if (obj.style.display == "none") {
						    obj.style.display = "block";
						    objlink.innerHTML = "- Page Rendering";
						  }
						  else {
						    obj.style.display = "none";
						    objlink.innerHTML = "+ Page Rendering";
						  }
						}
						
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
								showhide(check2,'region',50);
																
								check3.checked=null;
								showhide(check3,'process',50);
								
								check4.checked=null;
								showhide(check4,'validation',100);
								
								check5.checked=null;
								showhide(check5,'branch',50);
								
								check6.checked=null;
								showhide(check6,'computation',50);
								
								check1.checked='checked';
								
								}
							else{
								check1.checked=null;	
								
								check2.checked='checked';						
								showhide(check2,'region',50);

								check3.checked='checked';
								showhide(check3,'process',50);
								
								check4.checked='checked';
								showhide(check4,'validation',100);
								
								check5.checked='checked';
								showhide(check5,'branch',50);
			
								check6.checked='checked';
								showhide(check6,'computation',50);
								}								
						}
							
							
						
				]]>
				</xsl:text>
				
				</script>
			</head>
			<body>
			<table cellpadding="0" cellspacing="0" width="200" style="margin-bottom:25px; background-color:#eeeeee; border: 1px #888888 solid;">
				<tr>
					<td nowrap="nowrap" class="navlinks"><input type="checkbox" disabled="disabled" id="check1" checked="checked"/><a href="javascript:all(allctrl);" id="allctrl"> All</a></td>
					<td nowrap="nowrap" class="navlinks"><input type="checkbox" disabled="disabled" id="check2" checked="checked"/><a href="javascript:showhide(check2,'region',50)" id="regionsctrl"> Regions, Items &#38; Buttons</a></td>
					<!--
					<td nowrap="nowrap" class="navlinks"><a href="javascript:showhide(itemsctrl,'item',1000)" id="itemsctrl">- Items</a></td>
					<td nowrap="nowrap" class="navlinks"><a href="javascript:showhide(buttonsctrl,'button',100)" id="buttonsctrl">- Buttons</a></td>
					-->
					<td nowrap="nowrap" class="navlinks"><input type="checkbox" disabled="disabled" id="check3" checked="checked"/><a href="javascript:showhide(check3,'process',50)" id="processesctrl">Processes</a></td>
					<td nowrap="nowrap" class="navlinks"><input type="checkbox" disabled="disabled" id="check4" checked="checked"/><a href="javascript:showhide(check4,'validation',100)" id="validationsctrl"> Validations</a></td>
					<td nowrap="nowrap" class="navlinks"><input type="checkbox" disabled="disabled" id="check5" checked="checked"/><a href="javascript:showhide(check5,'branch',100)" id="branchesctrl"> Branches</a></td>
					<td nowrap="nowrap" class="navlinks"><input type="checkbox" disabled="disabled" id="check6" checked="checked"/><a href="javascript:showhide(check6,'computation',100)" id="computationsctrl"> Computations</a></td>
				</tr>
			</table>
				<xsl:for-each select="PAGES">
					<xsl:apply-templates select="PAGE"/>
					<table cellpadding="0" cellspacing="0" width="100%" style="margin-top:25px; margin-bottom: 10px;">
						<tr><td class="sectionhead1">Page Rendering</td></tr>
						<tr><td class="sectionhead2">&#160;</td></tr>
					</table>
					
						<xsl:for-each select="PAGE/REGIONS">
							<xsl:apply-templates select="REGION"/>
						</xsl:for-each>
						
						<xsl:for-each select="PAGE/PROCESSES/ON_LOAD">
							<xsl:apply-templates select="PROCESS"/>
						</xsl:for-each>					
					
					<table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:25px;">
						<tr><td class="sectionfoot">&#160;</td></tr>
						<tr><td class="sectionhead1">Page Rendering</td></tr>
					</table>


					<!-- PAGE PROCESSING  PAGE PROCESSING  PAGE PROCESSING-->
					<table cellpadding="0" cellspacing="0" width="100%" style="margin-top:40px; margin-bottom: 10px;page-break-before: always;">
						<tr><td class="sectionhead1">Page Processing</td></tr>
						<tr><td class="sectionhead2">&#160;</td></tr>
					</table>
					
						<xsl:for-each select="PAGE/BRANCHES/BRANCH[BRANCH_POINT='BEFORE_COMPUTATION']">
							<xsl:apply-templates select="."/>
						</xsl:for-each>

						
						<xsl:for-each select="PAGE/COMPUTATIONS">
							<xsl:apply-templates select="COMPUTATION"/>
						</xsl:for-each>
						
						<xsl:for-each select="PAGE/BRANCHES/BRANCH[BRANCH_POINT='BEFORE_VALIDATION']">
							<xsl:apply-templates select="."/>
						</xsl:for-each>
						
						<xsl:for-each select="PAGE/VALIDATIONS">
							<xsl:apply-templates select="VALIDATION"/>
						</xsl:for-each>
						
						<xsl:for-each select="PAGE/BRANCHES/BRANCH[BRANCH_POINT='BEFORE_PROCESSING']">
							<xsl:apply-templates select="."/>
						</xsl:for-each>

						<xsl:for-each select="PAGE/PROCESSES/ON_SUBMIT">
							<xsl:apply-templates select="PROCESS"/>
						</xsl:for-each>
						
						<xsl:for-each select="PAGE/BRANCHES/BRANCH[BRANCH_POINT='AFTER_PROCESSING']">
							<xsl:apply-templates select="."/>
						</xsl:for-each>
						
											
					<table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:25px;">
						<tr><td class="sectionfoot">&#160;</td></tr>
						<tr><td class="sectionhead1">Page Processing</td></tr>
					</table>
					
					<!-- HELP TEXT HELP TEXT HELP TEXT-->
					<table cellpadding="0" cellspacing="0" width="100%" style="margin-top:40px; margin-bottom: 10px;page-break-before: always;">
						<tr><td class="sectionhead1">Help Text</td></tr>
						<tr><td class="sectionhead2">&#160;</td></tr>
					</table>
					
					<table cellpadding="0" cellspacing="0" width="95%" class="region" align="center">
						<tr><td class="regiontitle"><span class="regiontitletext">Page Help</span></td></tr>
						<tr><td><span style="font-size: 8pt;"><xsl:value-of disable-output-escaping="yes" select="PAGE/HELP_TEXT"/></span></td></tr>
					</table>
					
					<br /><br />
					<table cellpadding="0" cellspacing="0" width="95%" class="region" align="center">
					<tr><td class="regiontitle" colspan="2"><span class="regiontitletext">Item Help</span></td></tr>
						<xsl:for-each select="PAGE/REGIONS/REGION/ITEMS/ITEM[string-length(HELP_TEXT) &gt; 1]">
							<xsl:call-template name="ITEM_HELP">
								<xsl:with-param name="name"><xsl:value-of select="NAME"/></xsl:with-param>
								<xsl:with-param name="help"><xsl:value-of select="HELP_TEXT"/></xsl:with-param>
							</xsl:call-template>
						</xsl:for-each>
					</table>
					
					<table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:25px;page-break-after: always;">
						<tr><td class="sectionfoot">&#160;</td></tr>
						<tr><td class="sectionhead1">Help Text</td></tr>
					</table>
					 
					 <table class="summary" cellpadding="0" cellspacing="0" align="center">
						<tr>
							<td style="background-color: #eeeeee; border-bottom: 1px #aaaaaa solid; padding: 2px; color:#666666; font-size:10pt; font-weight:bold;" nowrap="nowrap" colspan="7">
							Recent Changes
							</td>
						</tr>
						<tr>
							<td class="summarytitle">Developer</td>
							<td class="summarytitle">Date</td>
							<td class="summarytitle">Attribute</td>
							<td class="summarytitle">Action</td>
							<td class="summarytitle" nowrap="nowrap">Primary Key</td>							
							<td>&#160;</td>
						</tr>
						<xsl:for-each select="PAGE/HISTORY">
							<xsl:apply-templates select="ACTION"/>
						</xsl:for-each>
					</table>
					 
					 
					 
					<table class="summary" cellpadding="0" cellspacing="0" align="center">
						<tr>
							<td style="background-color: #eeeeee; border-bottom: 1px #aaaaaa solid; padding: 2px; color:#666666; font-size:10pt; font-weight:bold;" nowrap="nowrap" colspan="7">
							Page Summary
							</td>
						</tr>
						<tr>
							<td class="summarytitle">Regions</td>
							<td class="summarytitle">Items</td>
							<td class="summarytitle">Computations</td>
							<td class="summarytitle">Validations</td>
							<td class="summarytitle">Processes</td>							
							<td class="summarytitle">Branches</td>
							<td>&#160;</td>
						</tr>
						<tr>
							<td class="summaryvalue"><xsl:value-of select="count(PAGE/REGIONS/REGION)"/></td>					
  							<td class="summaryvalue"><xsl:value-of select="count(PAGE/REGIONS/REGION/ITEMS/ITEM)"/></td>
  							<td class="summaryvalue"><xsl:value-of select="count(PAGE/COMPUTATIONS/COMPUTATION)"/></td>
  							<td class="summaryvalue"><xsl:value-of select="count(PAGE/VALIDATIONS/VALIDATION)"/></td>
  							<td class="summaryvalue"><xsl:value-of select="count(PAGE/PROCESSES/ON_LOAD/PROCESS)+count(PAGE/PROCESSES/ON_SUBMIT/PROCESS)"/></td>
  							<td class="summaryvalue"><xsl:value-of select="count(PAGE/BRANCHES/BRANCH)"/></td>
  							<td>&#160;</td>
  						</tr>
					</table>				
					
				</xsl:for-each>
			</body>
		</html>
	</xsl:template>
	
	
	
	
	
	
	
	
	<xsl:template match="PAGE">
		<table class="page" cellspacing="0" cellpadding="0">
			<tr>	<td class="pagetitletop">Page: <xsl:value-of select="@ID"/> - <xsl:value-of select="NAME"/></td></tr>
			<tr><td class="pagetitlebottom">
				<table width="100%">
					<xsl:call-template name="PAGE_DETAILS"><xsl:with-param name="label">Title:                      </xsl:with-param><xsl:with-param name="value"><xsl:value-of select="STEP_TITLE"/></xsl:with-param></xsl:call-template> 
					<xsl:call-template name="PAGE_DETAILS"><xsl:with-param name="label">Alias:                      </xsl:with-param><xsl:with-param name="value"><xsl:value-of select="ALIAS"/></xsl:with-param></xsl:call-template> 
					<xsl:call-template name="PAGE_DETAILS"><xsl:with-param name="label">Name:                       </xsl:with-param><xsl:with-param name="value"><xsl:value-of select="NAME"/>               </xsl:with-param></xsl:call-template>
					<xsl:call-template name="PAGE_DETAILS"><xsl:with-param name="label">Title:                 </xsl:with-param><xsl:with-param name="value"><xsl:value-of select="STEP_TITLE"/>         </xsl:with-param></xsl:call-template>
					<xsl:call-template name="PAGE_DETAILS"><xsl:with-param name="label">Sub Title:             </xsl:with-param><xsl:with-param name="value"><xsl:value-of select="STEP_SUB_TITLE"/>     </xsl:with-param></xsl:call-template>
					<xsl:call-template name="PAGE_DETAILS"><xsl:with-param name="label">Sub Title Type:        </xsl:with-param><xsl:with-param name="value"><xsl:value-of select="STEP_SUB_TITLE_TYPE"/></xsl:with-param></xsl:call-template>
					<xsl:call-template name="PAGE_DETAILS"><xsl:with-param name="label">Welcome Text:               </xsl:with-param><xsl:with-param name="value"><xsl:value-of select="WELCOME_TEXT"/>       </xsl:with-param></xsl:call-template>
					<xsl:call-template name="PAGE_DETAILS"><xsl:with-param name="label">Box Welcome Text:           </xsl:with-param><xsl:with-param name="value"><xsl:value-of select="BOX_WELCOME_TEXT"/>   </xsl:with-param></xsl:call-template>
					<xsl:call-template name="PAGE_DETAILS"><xsl:with-param name="label">Box Footer Text:            </xsl:with-param><xsl:with-param name="value"><xsl:value-of select="BOX_FOOTER_TEXT"/>    </xsl:with-param></xsl:call-template>
					<xsl:call-template name="PAGE_DETAILS"><xsl:with-param name="label">Footer Text:                </xsl:with-param><xsl:with-param name="value"><xsl:value-of select="FOOTER_TEXT"/>        </xsl:with-param></xsl:call-template> 
					<xsl:call-template name="PAGE_DETAILS"><xsl:with-param name="label">First Item:                 </xsl:with-param><xsl:with-param name="value"><xsl:value-of select="FIRST_ITEM"/></xsl:with-param></xsl:call-template> 
					<xsl:call-template name="PAGE_DETAILS"><xsl:with-param name="label">Build Option:             </xsl:with-param><xsl:with-param name="value"><xsl:value-of select="REQUIRED_PATCH"/></xsl:with-param></xsl:call-template> 
					<xsl:call-template name="PAGE_DETAILS"><xsl:with-param name="label">Allow Duplicate Submissions:</xsl:with-param><xsl:with-param name="value"><xsl:value-of select="ALLOW_DUPLICATE_SUBMISSIONS"/></xsl:with-param></xsl:call-template> 
					<xsl:call-template name="PAGE_DETAILS"><xsl:with-param name="label">On Dup Submission Goto URL: </xsl:with-param><xsl:with-param name="value"><xsl:value-of select="ON_DUP_SUBMISSION_GOTO_URL"/></xsl:with-param></xsl:call-template> 
					<xsl:call-template name="PAGE_DETAILS"><xsl:with-param name="label">Page Template:              </xsl:with-param><xsl:with-param name="value"><xsl:value-of select="STEP_TEMPLATE"/></xsl:with-param></xsl:call-template> 
					<xsl:call-template name="PAGE_DETAILS"><xsl:with-param name="label">Html Page Header:           </xsl:with-param><xsl:with-param name="value"><xsl:value-of select="HTML_PAGE_HEADER"/></xsl:with-param></xsl:call-template> 
					<xsl:call-template name="PAGE_DETAILS"><xsl:with-param name="label">Page Is Public Y N:         </xsl:with-param><xsl:with-param name="value"><xsl:value-of select="PAGE_IS_PUBLIC_Y_N"/></xsl:with-param></xsl:call-template> 
					<xsl:call-template name="PAGE_DETAILS"><xsl:with-param name="label">Error Notification Text:    </xsl:with-param><xsl:with-param name="value"><xsl:value-of select="ERROR_NOTIFICATION_TEXT"/></xsl:with-param></xsl:call-template>  
					<xsl:call-template name="PAGE_DETAILS"><xsl:with-param name="label">Page Comment:               </xsl:with-param><xsl:with-param name="value"><xsl:value-of select="PAGE_COMMENT"/></xsl:with-param></xsl:call-template> 
					<xsl:call-template name="PAGE_DETAILS"><xsl:with-param name="label">Last Updated:            </xsl:with-param><xsl:with-param name="value"><xsl:value-of select="LAST_UPDATED_BY"/> - <xsl:value-of select="LAST_UPDATED_ON"/></xsl:with-param></xsl:call-template> 
					<xsl:call-template name="PAGE_DETAILS"><xsl:with-param name="label">Tab Set:                    </xsl:with-param><xsl:with-param name="value"><xsl:value-of select="TAB_SET"/></xsl:with-param></xsl:call-template> 
					<xsl:call-template name="PAGE_DETAILS"><xsl:with-param name="label">Security Scheme:            </xsl:with-param><xsl:with-param name="value"><xsl:value-of select="SECURITY_SCHEME"/></xsl:with-param></xsl:call-template> 
				<tr>
					<td class="pagesubtitle1" nowrap="nowrap">Parent Tabs:</td>
					<td class="pagesubtitle2" nowrap="nowrap">
						<table cellpadding="0" cellspacing="0">
							<tr>
								<xsl:apply-templates select="PARENT_TABS/PARENT_TAB"/>
							</tr>
						</table>
					</td>
				</tr>
				<tr>
					<td class="pagesubtitle1" nowrap="nowrap">Standard Tabs:</td>
					<td class="pagesubtitle2" nowrap="nowrap">
						<table cellpadding="0" cellspacing="0">
							<tr>
								<xsl:apply-templates select="STANDARD_TABS/STANDARD_TAB"/>
							</tr>
						</table>
					</td>
				</tr>
				</table>
				</td></tr>
		</table>
	</xsl:template>
	
	
	<!-- REGION REGION REGION REGION REGION REGION REGION REGION REGION REGION REGION REGION REGION REGION REGION REGION REGION REGION REGION REGION REGION REGION REGION REGION -->
	
	<xsl:template match="REGION">
		<xsl:element name="table">
		<xsl:attribute name="class">region</xsl:attribute>
		<xsl:attribute name="cellpadding">0</xsl:attribute>
		<xsl:attribute name="cellspacing">0</xsl:attribute>
		<xsl:attribute name="align">center</xsl:attribute>
		<xsl:attribute name="width">95%</xsl:attribute>
		<xsl:attribute name="id">region<xsl:value-of select="position()"/></xsl:attribute>
	
		<!--<table width="95%" class="region" cellpadding="0" cellspacing="0" align="center">-->
			<tr>
				<td class="regiontitle" width="50%" nowrap="nowrap">
					<span class="regiontitletext">Region: <xsl:value-of select="@NAME"/></span>
				</td>
				<td class="regiontitle" align="right">
					<span class="regiontype">[<xsl:value-of select="PLUG_SOURCE_TYPE"/>]</span>
				</td>
			</tr>
			<tr>
				<td class="regiontitle" width="100%" nowrap="nowrap" colspan="2">
				<table cellpadding="0" cellspacing="0" width="100%">
					<xsl:call-template name="REGION_DETAILS"><xsl:with-param name="label">Display Column:         </xsl:with-param><xsl:with-param name="value"><xsl:value-of select="PLUG_DISPLAY_COLUMN"/></xsl:with-param></xsl:call-template> 
					<xsl:call-template name="REGION_DETAILS"><xsl:with-param name="label">Display Sequence:       </xsl:with-param><xsl:with-param name="value"><xsl:value-of select="PLUG_DISPLAY_SEQUENCE"/></xsl:with-param></xsl:call-template> 
					<xsl:call-template name="REGION_DETAILS"><xsl:with-param name="label">Name:                   </xsl:with-param><xsl:with-param name="value"><xsl:value-of select="PLUG_NAME"/></xsl:with-param></xsl:call-template> 
					<xsl:call-template name="REGION_DETAILS"><xsl:with-param name="label">Region Template:               </xsl:with-param><xsl:with-param name="value"><xsl:value-of select="PLUG_TEMPLATE"/></xsl:with-param></xsl:call-template> 
					<xsl:call-template name="REGION_DETAILS"><xsl:with-param name="label">Display Sequence:       </xsl:with-param><xsl:with-param name="value"><xsl:value-of select="PLUG_DISPLAY_SEQUENCE"/></xsl:with-param></xsl:call-template> 
					<xsl:call-template name="REGION_DETAILS"><xsl:with-param name="label">Display Column:         </xsl:with-param><xsl:with-param name="value"><xsl:value-of select="PLUG_DISPLAY_COLUMN"/></xsl:with-param></xsl:call-template> 
					<xsl:call-template name="REGION_DETAILS"><xsl:with-param name="label">Display Point:          </xsl:with-param><xsl:with-param name="value"><xsl:value-of select="PLUG_DISPLAY_POINT"/></xsl:with-param></xsl:call-template> 
					<xsl:call-template name="REGION_DETAILS"><xsl:with-param name="label">Display Error Message:  </xsl:with-param><xsl:with-param name="value"><xsl:value-of select="PLUG_DISPLAY_ERROR_MESSAGE"/></xsl:with-param></xsl:call-template> 
					<xsl:call-template name="REGION_DETAILS"><xsl:with-param name="label">Create Link Text:       </xsl:with-param><xsl:with-param name="value"><xsl:value-of select="PLUG_CREATE_LINK_TEXT"/></xsl:with-param></xsl:call-template> 
					<xsl:call-template name="REGION_DETAILS"><xsl:with-param name="label">Create Link Target:     </xsl:with-param><xsl:with-param name="value"><xsl:value-of select="PLUG_CREATE_LINK_TARGET"/></xsl:with-param></xsl:call-template> 
					<xsl:call-template name="REGION_DETAILS"><xsl:with-param name="label">Create Image:           </xsl:with-param><xsl:with-param name="value"><xsl:value-of select="PLUG_CREATE_IMAGE"/></xsl:with-param></xsl:call-template> 
					<xsl:call-template name="REGION_DETAILS"><xsl:with-param name="label">Create Image Attributes:</xsl:with-param><xsl:with-param name="value"><xsl:value-of select="PLUG_CREATE_IMAGE_ATTRIBUTES"/></xsl:with-param></xsl:call-template> 
					<xsl:call-template name="REGION_DETAILS"><xsl:with-param name="label">Edit Link Text:         </xsl:with-param><xsl:with-param name="value"><xsl:value-of select="PLUG_EDIT_LINK_TEXT"/></xsl:with-param></xsl:call-template> 
					<xsl:call-template name="REGION_DETAILS"><xsl:with-param name="label">Edit Link Target:       </xsl:with-param><xsl:with-param name="value"><xsl:value-of select="PLUG_EDIT_LINK_TARGET"/></xsl:with-param></xsl:call-template> 
					<xsl:call-template name="REGION_DETAILS"><xsl:with-param name="label">Edit Image:             </xsl:with-param><xsl:with-param name="value"><xsl:value-of select="PLUG_EDIT_IMAGE"/></xsl:with-param></xsl:call-template> 
					<xsl:call-template name="REGION_DETAILS"><xsl:with-param name="label">Edit Image Attributes:  </xsl:with-param><xsl:with-param name="value"><xsl:value-of select="PLUG_EDIT_IMAGE_ATTRIBUTES"/></xsl:with-param></xsl:call-template> 
					<xsl:call-template name="REGION_DETAILS"><xsl:with-param name="label">Expand Link Text:       </xsl:with-param><xsl:with-param name="value"><xsl:value-of select="PLUG_EXPAND_LINK_TEXT"/></xsl:with-param></xsl:call-template> 
					<xsl:call-template name="REGION_DETAILS"><xsl:with-param name="label">Expand Link Target:     </xsl:with-param><xsl:with-param name="value"><xsl:value-of select="PLUG_EXPAND_LINK_TARGET"/></xsl:with-param></xsl:call-template> 
					<xsl:call-template name="REGION_DETAILS"><xsl:with-param name="label">Expand Image:           </xsl:with-param><xsl:with-param name="value"><xsl:value-of select="PLUG_EXPAND_IMAGE"/></xsl:with-param></xsl:call-template> 
					<xsl:call-template name="REGION_DETAILS"><xsl:with-param name="label">Expand Image Attributes:</xsl:with-param><xsl:with-param name="value"><xsl:value-of select="PLUG_EXPAND_IMAGE_ATTRIBUTES"/></xsl:with-param></xsl:call-template> 
					<xsl:call-template name="REGION_DETAILS"><xsl:with-param name="label">Close Link Text:        </xsl:with-param><xsl:with-param name="value"><xsl:value-of select="PLUG_CLOSE_LINK_TEXT"/></xsl:with-param></xsl:call-template> 
					<xsl:call-template name="REGION_DETAILS"><xsl:with-param name="label">Close Link Target:      </xsl:with-param><xsl:with-param name="value"><xsl:value-of select="PLUG_CLOSE_LINK_TARGET"/></xsl:with-param></xsl:call-template> 
					<xsl:call-template name="REGION_DETAILS"><xsl:with-param name="label">Close Image:            </xsl:with-param><xsl:with-param name="value"><xsl:value-of select="PLUG_CLOSE_IMAGE"/></xsl:with-param></xsl:call-template> 
					<xsl:call-template name="REGION_DETAILS"><xsl:with-param name="label">Close Image Attributes: </xsl:with-param><xsl:with-param name="value"><xsl:value-of select="PLUG_CLOSE_IMAGE_ATTRIBUTES"/></xsl:with-param></xsl:call-template> 
					<xsl:call-template name="REGION_DETAILS"><xsl:with-param name="label">Security Scheme:          </xsl:with-param><xsl:with-param name="value"><xsl:value-of select="PLUG_REQUIRED_ROLE"/></xsl:with-param></xsl:call-template> 
					<xsl:call-template name="REGION_DETAILS"><xsl:with-param name="label">Display Condition Type: </xsl:with-param><xsl:with-param name="value"><xsl:value-of select="PLUG_DISPLAY_CONDITION_TYPE"/></xsl:with-param></xsl:call-template> 
					<xsl:call-template name="REGION_DETAILS"><xsl:with-param name="label">Display When Condition: </xsl:with-param><xsl:with-param name="value"><xsl:value-of select="PLUG_DISPLAY_WHEN_CONDITION"/></xsl:with-param></xsl:call-template> 
					<xsl:call-template name="REGION_DETAILS"><xsl:with-param name="label">Display When Condition2: </xsl:with-param><xsl:with-param name="value"><xsl:value-of select="PLUG_DISPLAY_WHEN_COND2"/></xsl:with-param></xsl:call-template> 
					<xsl:call-template name="REGION_DETAILS"><xsl:with-param name="label">Header:                 </xsl:with-param><xsl:with-param name="value"><xsl:value-of select="PLUG_HEADER"/></xsl:with-param></xsl:call-template> 
					<xsl:call-template name="REGION_DETAILS"><xsl:with-param name="label">Footer:                 </xsl:with-param><xsl:with-param name="value"><xsl:value-of select="PLUG_FOOTER"/></xsl:with-param></xsl:call-template> 
                        <xsl:if test="PLUG_SOURCE_TYPE !='HTML Text' and substring(PLUG_SOURCE_TYPE,1,4)!='List' and PLUG_SOURCE_TYPE != 'PL/SQL' ">
					<xsl:call-template name="REGION_DETAILS"><xsl:with-param name="label">Row Template:     </xsl:with-param><xsl:with-param name="value"><xsl:value-of select="PLUG_QUERY_ROW_TEMPLATE"/></xsl:with-param></xsl:call-template> 
					<xsl:call-template name="REGION_DETAILS"><xsl:with-param name="label">Query Headings:         </xsl:with-param><xsl:with-param name="value"><xsl:value-of select="PLUG_QUERY_HEADINGS"/></xsl:with-param></xsl:call-template> 
					<xsl:call-template name="REGION_DETAILS"><xsl:with-param name="label">Query Headings Type:    </xsl:with-param><xsl:with-param name="value"><xsl:value-of select="PLUG_QUERY_HEADINGS_TYPE"/></xsl:with-param></xsl:call-template> 
					<xsl:call-template name="REGION_DETAILS"><xsl:with-param name="label">Query Num Rows:         </xsl:with-param><xsl:with-param name="value"><xsl:value-of select="PLUG_QUERY_NUM_ROWS"/></xsl:with-param></xsl:call-template> 
					<xsl:call-template name="REGION_DETAILS"><xsl:with-param name="label">Query Format Out:       </xsl:with-param><xsl:with-param name="value"><xsl:value-of select="PLUG_QUERY_FORMAT_OUT"/></xsl:with-param></xsl:call-template> 
					<xsl:call-template name="REGION_DETAILS"><xsl:with-param name="label">Query Show Nulls As:    </xsl:with-param><xsl:with-param name="value"><xsl:value-of select="PLUG_QUERY_SHOW_NULLS_AS"/></xsl:with-param></xsl:call-template> 
					<xsl:call-template name="REGION_DETAILS"><xsl:with-param name="label">Query Col Allignments:  </xsl:with-param><xsl:with-param name="value"><xsl:value-of select="PLUG_QUERY_COL_ALLIGNMENTS"/></xsl:with-param></xsl:call-template> 
					<xsl:call-template name="REGION_DETAILS"><xsl:with-param name="label">Query Break Cols:       </xsl:with-param><xsl:with-param name="value"><xsl:value-of select="PLUG_QUERY_BREAK_COLS"/></xsl:with-param></xsl:call-template> 
					<xsl:call-template name="REGION_DETAILS"><xsl:with-param name="label">Query Sum Cols:         </xsl:with-param><xsl:with-param name="value"><xsl:value-of select="PLUG_QUERY_SUM_COLS"/></xsl:with-param></xsl:call-template> 
					<xsl:call-template name="REGION_DETAILS"><xsl:with-param name="label">Query Number Formats:   </xsl:with-param><xsl:with-param name="value"><xsl:value-of select="PLUG_QUERY_NUMBER_FORMATS"/></xsl:with-param></xsl:call-template> 
					<xsl:call-template name="REGION_DETAILS"><xsl:with-param name="label">Query Table Border:     </xsl:with-param><xsl:with-param name="value"><xsl:value-of select="PLUG_QUERY_TABLE_BORDER"/></xsl:with-param></xsl:call-template> 
					<xsl:call-template name="REGION_DETAILS"><xsl:with-param name="label">Query Options:          </xsl:with-param><xsl:with-param name="value"><xsl:value-of select="PLUG_QUERY_OPTIONS"/></xsl:with-param></xsl:call-template>
					<xsl:call-template name="REGION_DETAILS"><xsl:with-param name="label">Query Num Rows Type:    </xsl:with-param><xsl:with-param name="value"><xsl:value-of select="PLUG_QUERY_NUM_ROWS_TYPE"/></xsl:with-param></xsl:call-template> 
					<xsl:call-template name="REGION_DETAILS"><xsl:with-param name="label">Query Num Rows Item:    </xsl:with-param><xsl:with-param name="value"><xsl:value-of select="PLUG_QUERY_NUM_ROWS_ITEM"/></xsl:with-param></xsl:call-template> 
					<xsl:call-template name="REGION_DETAILS"><xsl:with-param name="label">Query Row Count Max:    </xsl:with-param><xsl:with-param name="value"><xsl:value-of select="PLUG_QUERY_ROW_COUNT_MAX"/></xsl:with-param></xsl:call-template> 
				  </xsl:if>
					<xsl:call-template name="REGION_DETAILS"><xsl:with-param name="label">Column Width:           </xsl:with-param><xsl:with-param name="value"><xsl:value-of select="PLUG_COLUMN_WIDTH"/></xsl:with-param></xsl:call-template> 
					<xsl:call-template name="REGION_DETAILS"><xsl:with-param name="label">Build Option:              </xsl:with-param><xsl:with-param name="value"><xsl:value-of select="REQUIRED_PATCH"/></xsl:with-param></xsl:call-template> 
					<xsl:call-template name="REGION_DETAILS"><xsl:with-param name="label">Region Url Text Begin:         </xsl:with-param><xsl:with-param name="value"><xsl:value-of select="PLUG_URL_TEXT_BEGIN"/></xsl:with-param></xsl:call-template> 
					<xsl:call-template name="REGION_DETAILS"><xsl:with-param name="label">Region Url Text End:           </xsl:with-param><xsl:with-param name="value"><xsl:value-of select="PLUG_URL_TEXT_END"/></xsl:with-param></xsl:call-template> 
					<xsl:call-template name="REGION_DETAILS"><xsl:with-param name="label">Java Entry Point:            </xsl:with-param><xsl:with-param name="value"><xsl:value-of select="JAVA_ENTRY_POINT"/></xsl:with-param></xsl:call-template> 
					<xsl:call-template name="REGION_DETAILS"><xsl:with-param name="label">Caching:                </xsl:with-param><xsl:with-param name="value"><xsl:value-of select="PLUG_CACHING"/></xsl:with-param></xsl:call-template> 
					<xsl:call-template name="REGION_DETAILS"><xsl:with-param name="label">Caching Session State:  </xsl:with-param><xsl:with-param name="value"><xsl:value-of select="PLUG_CACHING_SESSION_STATE"/></xsl:with-param></xsl:call-template> 
					<xsl:call-template name="REGION_DETAILS"><xsl:with-param name="label">Caching Max Age In Sec: </xsl:with-param><xsl:with-param name="value"><xsl:value-of select="PLUG_CACHING_MAX_AGE_IN_SEC"/></xsl:with-param></xsl:call-template> 
					<xsl:call-template name="REGION_DETAILS"><xsl:with-param name="label">Comment:                </xsl:with-param><xsl:with-param name="value"><xsl:value-of select="PLUG_COMMENT"/></xsl:with-param></xsl:call-template> 
										<xsl:call-template name="REGION_DETAILS"><xsl:with-param name="label">Region Query No Data Found:    </xsl:with-param><xsl:with-param name="value"><xsl:value-of select="PLUG_QUERY_NO_DATA_FOUND"/></xsl:with-param></xsl:call-template> 
					<xsl:call-template name="REGION_DETAILS"><xsl:with-param name="label">Region Ignore Pagination:      </xsl:with-param><xsl:with-param name="value"><xsl:value-of select="PLUG_IGNORE_PAGINATION"/></xsl:with-param></xsl:call-template> 
					<xsl:call-template name="REGION_DETAILS"><xsl:with-param name="label">Last Updated:             	</xsl:with-param><xsl:with-param name="value"><xsl:value-of select="LAST_UPDATED_BY"/> - <xsl:value-of select="LAST_UPDATED_ON"/>				</xsl:with-param>	</xsl:call-template> 
					
					<xsl:call-template name="REGION_DETAILS"><xsl:with-param name="label">Chart Font Size:        </xsl:with-param><xsl:with-param name="value"><xsl:value-of select="PLUG_CHART_FONT_SIZE"/></xsl:with-param></xsl:call-template> 
					<xsl:call-template name="REGION_DETAILS"><xsl:with-param name="label">Chart Max Rows:         </xsl:with-param><xsl:with-param name="value"><xsl:value-of select="PLUG_CHART_MAX_ROWS"/></xsl:with-param></xsl:call-template> 
					<xsl:call-template name="REGION_DETAILS"><xsl:with-param name="label">Chart Num Mask:         </xsl:with-param><xsl:with-param name="value"><xsl:value-of select="PLUG_CHART_NUM_MASK"/></xsl:with-param></xsl:call-template> 
					<xsl:call-template name="REGION_DETAILS"><xsl:with-param name="label">Chart Scale:            </xsl:with-param><xsl:with-param name="value"><xsl:value-of select="PLUG_CHART_SCALE"/></xsl:with-param></xsl:call-template> 
					<xsl:call-template name="REGION_DETAILS"><xsl:with-param name="label">Chart Axis:             </xsl:with-param><xsl:with-param name="value"><xsl:value-of select="PLUG_CHART_AXIS"/></xsl:with-param></xsl:call-template> 
				<xsl:call-template name="REGION_DETAILS"><xsl:with-param name="label">Chart Show Summary:     </xsl:with-param><xsl:with-param name="value"><xsl:value-of select="PLUG_CHART_SHOW_SUMMARY"/></xsl:with-param></xsl:call-template> 
			</table>
				</td>
			</tr>
			<tr>
					<td colspan="2">
					<xsl:for-each select="BUTTONS">
						<xsl:apply-templates select="BUTTON"/>
					</xsl:for-each>					
					<xsl:for-each select="ITEMS">
						<xsl:apply-templates select="ITEM"/>
					</xsl:for-each>
					</td>
			</tr>
			<tr>
				<td colspan="2">
					<xsl:if test="string-length(PLUG_SOURCE) &gt; 5">
						<span class="regionsubtitletext">Source:</span>
						<xsl:choose>
							<xsl:when test="PLUG_SOURCE_TYPE='HTML Text' ">
								<div class="code"><xsl:value-of disable-output-escaping="yes" select="PLUG_SOURCE"/></div>
							</xsl:when>
							<xsl:otherwise>
								<div class="code"><xsl:value-of disable-output-escaping="yes" select="PLUG_SOURCE"/></div>
							</xsl:otherwise>
						</xsl:choose>
					</xsl:if>
				</td>
			</tr>
<!--		</table>-->
	</xsl:element>
	</xsl:template>
	
	
	<!-- ITEM ITEM ITEM ITEM ITEM ITEM ITEM ITEM ITEM ITEM ITEM ITEM ITEM ITEM ITEM ITEM ITEM ITEM ITEM ITEM ITEM ITEM ITEM ITEM ITEM ITEM ITEM ITEM ITEM ITEM ITEM ITEM ITEM ITEM ITEM ITEM ITEM ITEM ITEM -->	
	
	<xsl:template match="ITEM">
		<xsl:element name="table">
			<xsl:attribute name="class">itemouter</xsl:attribute>
			<xsl:attribute name="cellpadding">0</xsl:attribute>
			<xsl:attribute name="cellspacing">0</xsl:attribute>
			<xsl:attribute name="align">center</xsl:attribute>
			<xsl:attribute name="width">100%</xsl:attribute>
			<xsl:attribute name="id">item<xsl:value-of select="@JS_ID"/></xsl:attribute>


<!--		<table class="itemouter" width="100%" cellpadding="0" cellspacing="0" >-->

			<tr><td class="itmeoutertop">&#160;</td><td width="99%">&#160;</td></tr>
			<tr><td colspan="2" align="left">
			
				<table style="width:8.5in;" cellpadding="0" cellspacing="0">
					<xsl:call-template name="ITEM_DETAILS"><xsl:with-param name="label">Item Name:</xsl:with-param>                 <xsl:with-param name="value"><xsl:value-of select="NAME"/></xsl:with-param></xsl:call-template>
					<xsl:call-template name="ITEM_DETAILS"><xsl:with-param name="label">Prompt:</xsl:with-param>                    <xsl:with-param name="value"><xsl:value-of select="PROMPT"/></xsl:with-param></xsl:call-template>
					<xsl:call-template name="ITEM_DETAILS"><xsl:with-param name="label">Type:</xsl:with-param>                      <xsl:with-param name="value"><xsl:value-of select="DATA_TYPE"/></xsl:with-param></xsl:call-template>
					<xsl:call-template name="ITEM_DETAILS"><xsl:with-param name="label">Accept Processing:</xsl:with-param>         <xsl:with-param name="value"><xsl:value-of select="ACCEPT_PROCESSING"/></xsl:with-param></xsl:call-template>
					<xsl:call-template name="ITEM_DETAILS"><xsl:with-param name="label">Use Cache Before Default:</xsl:with-param>  <xsl:with-param name="value"><xsl:value-of select="USE_CACHE_BEFORE_DEFAULT"/></xsl:with-param></xsl:call-template>
					<xsl:call-template name="ITEM_CODE"><xsl:with-param name="label">Source:</xsl:with-param>                    <xsl:with-param name="value"><xsl:value-of select="SOURCE"/></xsl:with-param></xsl:call-template>
					<xsl:call-template name="ITEM_DETAILS"><xsl:with-param name="label">Source Type:</xsl:with-param>               <xsl:with-param name="value"><xsl:value-of select="SOURCE_TYPE"/></xsl:with-param></xsl:call-template>
					<xsl:call-template name="ITEM_DETAILS"><xsl:with-param name="label">Display As:</xsl:with-param>                <xsl:with-param name="value"><xsl:value-of select="DISPLAY_AS"/></xsl:with-param></xsl:call-template>
					<xsl:call-template name="ITEM_DETAILS"><xsl:with-param name="label">Named Lov:</xsl:with-param>                 <xsl:with-param name="value"><xsl:value-of select="NAMED_LOV"/></xsl:with-param></xsl:call-template>
					<xsl:call-template name="ITEM_CODE"><xsl:with-param name="label">Lov:</xsl:with-param>                          <xsl:with-param name="value"><xsl:value-of select="LOV"/></xsl:with-param></xsl:call-template>
					<xsl:call-template name="ITEM_DETAILS"><xsl:with-param name="label">Lov Columns:</xsl:with-param>               <xsl:with-param name="value"><xsl:value-of select="LOV_COLUMNS"/></xsl:with-param></xsl:call-template>
					<xsl:call-template name="ITEM_DETAILS"><xsl:with-param name="label">Lov Display Null:</xsl:with-param>          <xsl:with-param name="value"><xsl:value-of select="LOV_DISPLAY_NULL"/></xsl:with-param></xsl:call-template>
					<xsl:call-template name="ITEM_DETAILS"><xsl:with-param name="label">Lov Translated:</xsl:with-param>            <xsl:with-param name="value"><xsl:value-of select="LOV_TRANSLATED"/></xsl:with-param></xsl:call-template>
					<xsl:call-template name="ITEM_DETAILS"><xsl:with-param name="label">Size:</xsl:with-param>                      <xsl:with-param name="value"><xsl:value-of select="CSIZE"/></xsl:with-param></xsl:call-template>
					<xsl:call-template name="ITEM_DETAILS"><xsl:with-param name="label">Maxlength:</xsl:with-param>                 <xsl:with-param name="value"><xsl:value-of select="CMAXLENGTH"/></xsl:with-param></xsl:call-template>
					<xsl:call-template name="ITEM_DETAILS"><xsl:with-param name="label">Height:</xsl:with-param>                    <xsl:with-param name="value"><xsl:value-of select="CHEIGHT"/></xsl:with-param></xsl:call-template>
					<xsl:call-template name="ITEM_DETAILS"><xsl:with-param name="label">Begin On New Line:</xsl:with-param>         <xsl:with-param name="value"><xsl:value-of select="BEGIN_ON_NEW_LINE"/></xsl:with-param></xsl:call-template>
					<xsl:call-template name="ITEM_DETAILS"><xsl:with-param name="label">Begin On New Field:</xsl:with-param>        <xsl:with-param name="value"><xsl:value-of select="BEGIN_ON_NEW_FIELD"/></xsl:with-param></xsl:call-template>
					<xsl:call-template name="ITEM_DETAILS"><xsl:with-param name="label">Colspan:</xsl:with-param>                   <xsl:with-param name="value"><xsl:value-of select="COLSPAN"/></xsl:with-param></xsl:call-template>
					<xsl:call-template name="ITEM_DETAILS"><xsl:with-param name="label">Rowspan:</xsl:with-param>                   <xsl:with-param name="value"><xsl:value-of select="ROWSPAN"/></xsl:with-param></xsl:call-template>
					<xsl:call-template name="ITEM_DETAILS"><xsl:with-param name="label">Label Alignment:</xsl:with-param>           <xsl:with-param name="value"><xsl:value-of select="LABEL_ALIGNMENT"/></xsl:with-param></xsl:call-template>
					<xsl:call-template name="ITEM_DETAILS"><xsl:with-param name="label">Field Alignment:</xsl:with-param>           <xsl:with-param name="value"><xsl:value-of select="FIELD_ALIGNMENT"/></xsl:with-param></xsl:call-template>
					<xsl:call-template name="ITEM_DETAILS"><xsl:with-param name="label">Item Help Text:</xsl:with-param>            <xsl:with-param name="value"><xsl:value-of select="ITEM_HELP_TEXT"/></xsl:with-param></xsl:call-template>
					<xsl:call-template name="ITEM_DETAILS"><xsl:with-param name="label">Item Field Template:</xsl:with-param>       <xsl:with-param name="value"><xsl:value-of select="ITEM_FIELD_TEMPLATE"/></xsl:with-param></xsl:call-template>
					<xsl:call-template name="ITEM_DETAILS"><xsl:with-param name="label">Post Element Text:</xsl:with-param>         <xsl:with-param name="value"><xsl:value-of select="POST_ELEMENT_TEXT"/></xsl:with-param></xsl:call-template>
					<xsl:call-template name="ITEM_DETAILS"><xsl:with-param name="label">Display Type:</xsl:with-param>         <xsl:with-param name="value"><xsl:value-of select="DISPLAY_WHEN_TYPE"/></xsl:with-param></xsl:call-template>
					<xsl:call-template name="ITEM_DETAILS"><xsl:with-param name="label">Display Condition:</xsl:with-param>         <xsl:with-param name="value"><xsl:value-of select="DISPLAY_WHEN"/></xsl:with-param></xsl:call-template>
					<xsl:call-template name="ITEM_DETAILS"><xsl:with-param name="label">Display Condition2:</xsl:with-param>         <xsl:with-param name="value"><xsl:value-of select="DISPLAY_WHEN2"/></xsl:with-param></xsl:call-template>	
                    <xsl:call-template name="ITEM_DETAILS"><xsl:with-param name="label">Lov Display Extra:</xsl:with-param>         <xsl:with-param name="value"><xsl:value-of select="LOV_DISPLAY_EXTRA"/></xsl:with-param></xsl:call-template>
				</table>
				
			</td></tr>
			<tr><td class="itmeouterbottom">&#160;</td><td width="99%">&#160;</td></tr>
<!--		</table>-->
		</xsl:element>
	</xsl:template>

	<xsl:template match="BUTTON">
		<xsl:element name="table">
			<xsl:attribute name="class">itemouter</xsl:attribute>
			<xsl:attribute name="cellpadding">0</xsl:attribute>
			<xsl:attribute name="cellspacing">0</xsl:attribute>
			<xsl:attribute name="align">center</xsl:attribute>
			<xsl:attribute name="width">100%</xsl:attribute>
			<xsl:attribute name="id">button<xsl:value-of select="@JS_ID"/></xsl:attribute>
			
		<!--<table class="itemouter" width="100%" cellpadding="0" cellspacing="0">-->
			<tr><td class="itmeoutertop">&#160;</td><td width="99%">&#160;</td></tr>
			<tr><td colspan="2" align="left">
			
				<table width="100%" cellpadding="0" cellspacing="0">
                    		<xsl:call-template name="ITEM_DETAILS"><xsl:with-param name="label">Button Name:</xsl:with-param><xsl:with-param name="value"><xsl:value-of select="@NAME"/></xsl:with-param></xsl:call-template>
                    		<xsl:call-template name="ITEM_DETAILS"><xsl:with-param name="label">Button Sequence:</xsl:with-param><xsl:with-param name="value"><xsl:value-of select="BUTTON_SEQUENCE"/></xsl:with-param></xsl:call-template>
			       <!--<xsl:call-template name="ITEM_DETAILS"><xsl:with-param name="label">Button RegionId:</xsl:with-param><xsl:with-param name="value"><xsl:value-of select="BUTTON_PLUG_ID"/></xsl:with-param></xsl:call-template>-->
					<xsl:call-template name="ITEM_DETAILS"><xsl:with-param name="label">Button Image:</xsl:with-param><xsl:with-param name="value"><xsl:value-of select="BUTTON_IMAGE"/></xsl:with-param></xsl:call-template>
					<xsl:call-template name="ITEM_DETAILS"><xsl:with-param name="label">Button ImageAlt:</xsl:with-param><xsl:with-param name="value"><xsl:value-of select="BUTTON_IMAGE_ALT"/></xsl:with-param></xsl:call-template>
					<xsl:call-template name="ITEM_DETAILS"><xsl:with-param name="label">Button Position:</xsl:with-param><xsl:with-param name="value"><xsl:value-of select="BUTTON_POSITION"/></xsl:with-param></xsl:call-template>
					<xsl:call-template name="ITEM_DETAILS"><xsl:with-param name="label">Button RedirectUrl:</xsl:with-param><xsl:with-param name="value"><xsl:value-of select="BUTTON_REDIRECT_URL"/></xsl:with-param></xsl:call-template>
                                <xsl:call-template name="ITEM_DETAILS"><xsl:with-param name="label">Button Condition Type:</xsl:with-param><xsl:with-param name="value"><xsl:value-of select="BUTTON_CONDITION_TYPE"/></xsl:with-param></xsl:call-template>
					<xsl:call-template name="ITEM_DETAILS"><xsl:with-param name="label">Button Condition:</xsl:with-param><xsl:with-param name="value"><xsl:value-of select="BUTTON_CONDITION"/></xsl:with-param></xsl:call-template>
					<xsl:call-template name="ITEM_DETAILS"><xsl:with-param name="label">Button Condition2:</xsl:with-param><xsl:with-param name="value"><xsl:value-of select="BUTTON_CONDITION2"/></xsl:with-param></xsl:call-template>					
					<xsl:call-template name="ITEM_DETAILS"><xsl:with-param name="label">Button ImageAttributes:</xsl:with-param><xsl:with-param name="value"><xsl:value-of select="BUTTON_IMAGE_ATTRIBUTES"/></xsl:with-param></xsl:call-template>
					<xsl:call-template name="ITEM_DETAILS"><xsl:with-param name="label">Build Option:</xsl:with-param><xsl:with-param name="value"><xsl:value-of select="REQUIRED_PATCH"/></xsl:with-param></xsl:call-template>
					<xsl:call-template name="ITEM_DETAILS"><xsl:with-param name="label">Security Scheme:</xsl:with-param><xsl:with-param name="value"><xsl:value-of select="SECURITY_SCHEME"/></xsl:with-param></xsl:call-template>
					<xsl:call-template name="ITEM_DETAILS"><xsl:with-param name="label">Button Alignment:</xsl:with-param><xsl:with-param name="value"><xsl:value-of select="BUTTON_ALIGNMENT"/></xsl:with-param></xsl:call-template>
					<xsl:call-template name="ITEM_DETAILS"><xsl:with-param name="label">Button Cattributes:</xsl:with-param><xsl:with-param name="value"><xsl:value-of select="BUTTON_CATTRIBUTES"/></xsl:with-param></xsl:call-template>
					<xsl:call-template name="ITEM_DETAILS"><xsl:with-param name="label">Last Updated:</xsl:with-param><xsl:with-param name="value"><xsl:value-of select="LAST_UPDATED_BY"/> - <xsl:value-of select="LAST_UPDATED_ON"/></xsl:with-param></xsl:call-template>
				   <xsl:call-template name="ITEM_DETAILS"><xsl:with-param name="label">Button Comment         :</xsl:with-param><xsl:with-param name="value"><xsl:value-of  select="BUTTON_COMMENT"/></xsl:with-param></xsl:call-template>
				</table>
				
			</td></tr>
			<tr><td class="itmeouterbottom">&#160;</td><td width="99%">&#160;</td></tr>
		</xsl:element>
		<!--</table>-->
	</xsl:template>


	<xsl:template match="PARENT_TAB | STANDARD_TAB">
		<xsl:choose>
			<xsl:when test="./@CURRENT='YES'">
				<td class="pagesubtitle2" style="border:1px #ffffff solid; padding:1px;"><xsl:value-of select="."/></td>
			</xsl:when>
			<xsl:otherwise>
				<td class="pagesubtitle2" style="padding:2px;"><xsl:value-of select="."/></td>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:template>
	
	<xsl:template match="PROCESS">
	<xsl:element name="div">
		<xsl:attribute name="id">process<xsl:value-of select="@JS_ID"/></xsl:attribute>
		<table width="95%" class="processshow" cellpadding="0" cellspacing="0" align="center">
			<tr>
				<td class="processtitle" width="50%" nowrap="nowrap">
					<span class="regiontitletext">Process: <xsl:value-of select="@NAME"/></span>
				</td>
				<td class="processtitle" align="right">
					<span class="regiontype">[<xsl:value-of select="PROCESS_TYPE"/>]</span>
				</td>
			</tr>
			
			
			<tr>
				<td colspan="2">
					<table width="100%" cellpadding="0" cellspacing="0">
                    <xsl:call-template name="ITEM_DETAILS"><xsl:with-param name="label">Name:           </xsl:with-param><xsl:with-param name="value"><xsl:value-of select="@NAME"/></xsl:with-param></xsl:call-template>
						<xsl:call-template name="ITEM_DETAILS"><xsl:with-param name="label">Sequence:       </xsl:with-param><xsl:with-param name="value"><xsl:value-of select="PROCESS_SEQUENCE"/></xsl:with-param></xsl:call-template>        
						<xsl:call-template name="ITEM_DETAILS"><xsl:with-param name="label">Point:          </xsl:with-param><xsl:with-param name="value"><xsl:value-of select="PROCESS_POINT"/></xsl:with-param></xsl:call-template>          
						<xsl:call-template name="ITEM_DETAILS"><xsl:with-param name="label">Type:           </xsl:with-param><xsl:with-param name="value"><xsl:value-of select="PROCESS_TYPE"/></xsl:with-param></xsl:call-template>                      
						        
						<xsl:call-template name="ITEM_DETAILS"><xsl:with-param name="label">Error Message:  </xsl:with-param><xsl:with-param name="value"><xsl:value-of select="PROCESS_ERROR_MESSAGE"/></xsl:with-param></xsl:call-template>        
						<xsl:call-template name="ITEM_DETAILS"><xsl:with-param name="label">When Button Id: </xsl:with-param><xsl:with-param name="value"><xsl:value-of select="PROCESS_WHEN_BUTTON_ID"/></xsl:with-param></xsl:call-template>        
						<xsl:call-template name="ITEM_DETAILS"><xsl:with-param name="label">When:           </xsl:with-param><xsl:with-param name="value"><xsl:value-of select="PROCESS_WHEN"/></xsl:with-param></xsl:call-template>           
						<xsl:call-template name="ITEM_DETAILS"><xsl:with-param name="label">When Type:      </xsl:with-param><xsl:with-param name="value"><xsl:value-of select="PROCESS_WHEN_TYPE"/></xsl:with-param></xsl:call-template>        
						<xsl:call-template name="ITEM_DETAILS"><xsl:with-param name="label">Success Message:</xsl:with-param><xsl:with-param name="value"><xsl:value-of select="PROCESS_SUCCESS_MESSAGE"/></xsl:with-param></xsl:call-template>        
						<xsl:call-template name="ITEM_DETAILS"><xsl:with-param name="label">Build Option:         </xsl:with-param><xsl:with-param name="value"><xsl:value-of select="REQUIRED_PATCH"/></xsl:with-param></xsl:call-template>         
						<xsl:call-template name="ITEM_DETAILS"><xsl:with-param name="label">Comment:        </xsl:with-param><xsl:with-param name="value"><xsl:value-of select="PROCESS_COMMENT"/></xsl:with-param></xsl:call-template>        
						<xsl:call-template name="ITEM_DETAILS"><xsl:with-param name="label">Last Updated:        </xsl:with-param><xsl:with-param name="value"><xsl:value-of select="LAST_UPDATED_BY"/> - <xsl:value-of select="LAST_UPDATED_ON"/></xsl:with-param>				</xsl:call-template>        
						<xsl:call-template name="ITEM_DETAILS"><xsl:with-param name="label">When2:          </xsl:with-param><xsl:with-param name="value"><xsl:value-of select="PROCESS_WHEN2"/></xsl:with-param></xsl:call-template>          
						<xsl:call-template name="ITEM_DETAILS"><xsl:with-param name="label">When Type2:     </xsl:with-param><xsl:with-param name="value"><xsl:value-of select="PROCESS_WHEN_TYPE2"/></xsl:with-param></xsl:call-template>        
						<xsl:call-template name="ITEM_DETAILS"><xsl:with-param name="label">Security Scheme:        </xsl:with-param><xsl:with-param name="value"><xsl:value-of select="SECURITY_SCHEME"/></xsl:with-param></xsl:call-template>
						<xsl:call-template name="ITEM_CODE"><xsl:with-param name="label">Source:       </xsl:with-param><xsl:with-param name="value"><xsl:value-of select="PROCESS_SQL_CLOB"/></xsl:with-param></xsl:call-template>      
					</table>

				</td>
			</tr>
		</table>
		<xsl:choose>
			<xsl:when test="parent::ON_LOAD">
				<table width="100%" cellpadding="0" cellspacing="0"><tr><td>&#160;</td><td width="50%">&#160;</td></tr></table>
			</xsl:when>
			<xsl:otherwise>
				<table width="100%" cellpadding="0" cellspacing="0"><tr><td class="procline">&#160;</td><td width="50%">&#160;</td></tr></table>
			</xsl:otherwise>
		</xsl:choose>
		</xsl:element>
	</xsl:template>
	
	<xsl:template match="VALIDATION">
	<xsl:element name="div">
		<xsl:attribute name="id">validation<xsl:value-of select="@JS_ID"/></xsl:attribute>
		<table width="95%" class="processaccept" cellpadding="0" cellspacing="0" align="center">
			<tr>
				<td class="processtitle" width="10%" nowrap="nowrap">
					<span class="regiontitletext">Validation: <xsl:value-of select="@NAME"/></span>
				</td>
				<td class="processtitle" align="right">
					<span class="regiontype">[<xsl:value-of select="VALIDATION_TYPE"/>]</span>
				</td>
			</tr>
			
			
			<tr>
				<td colspan="2">
					<table width="100%" cellpadding="0" cellspacing="0">
                   <xsl:call-template name="ITEM_DETAILS"><xsl:with-param name="label">Sequence:      </xsl:with-param><xsl:with-param name="value"><xsl:value-of select="VALIDATION_SEQUENCE"/></xsl:with-param></xsl:call-template>
						<xsl:call-template name="ITEM_DETAILS"><xsl:with-param name="label">Condition Type:</xsl:with-param><xsl:with-param name="value"><xsl:value-of select="VALIDATION_CONDITION_TYPE"/></xsl:with-param></xsl:call-template>
						<xsl:call-template name="ITEM_DETAILS"><xsl:with-param name="label">Condition:     </xsl:with-param><xsl:with-param name="value"><xsl:value-of select="VALIDATION_CONDITION"/></xsl:with-param></xsl:call-template>
						<xsl:call-template name="ITEM_DETAILS"><xsl:with-param name="label">Condition2:     </xsl:with-param><xsl:with-param name="value"><xsl:value-of select="VALIDATION_CONDITION2"/></xsl:with-param></xsl:call-template>
						<xsl:call-template name="ITEM_DETAILS"><xsl:with-param name="label">Error Message:            </xsl:with-param><xsl:with-param name="value"><xsl:value-of select="ERROR_MESSAGE"/></xsl:with-param></xsl:call-template>
						<xsl:call-template name="ITEM_DETAILS"><xsl:with-param name="label">Build Option:           </xsl:with-param><xsl:with-param name="value"><xsl:value-of select="REQUIRED_PATCH"/></xsl:with-param></xsl:call-template>
						<xsl:call-template name="ITEM_DETAILS"><xsl:with-param name="label">Comment:       </xsl:with-param><xsl:with-param name="value"><xsl:value-of select="VALIDATION_COMMENT"/></xsl:with-param></xsl:call-template>
						<xsl:call-template name="ITEM_DETAILS"><xsl:with-param name="label">Last Updated By:          </xsl:with-param><xsl:with-param name="value"><xsl:value-of select="LAST_UPDATED_BY"/> - <xsl:value-of select="LAST_UPDATED_ON"/></xsl:with-param></xsl:call-template>
						<xsl:call-template name="ITEM_DETAILS"><xsl:with-param name="label">Validation2:              </xsl:with-param><xsl:with-param name="value"><xsl:value-of select="VALIDATION2"/></xsl:with-param></xsl:call-template>
						<xsl:call-template name="ITEM_DETAILS"><xsl:with-param name="label">When Button Pressed:      </xsl:with-param><xsl:with-param name="value"><xsl:value-of select="WHEN_BUTTON_PRESSED"/></xsl:with-param></xsl:call-template>
						<xsl:call-template name="ITEM_DETAILS"><xsl:with-param name="label">Security Scheme:          </xsl:with-param><xsl:with-param name="value"><xsl:value-of select="SECURITY_SCHEME"/></xsl:with-param></xsl:call-template>
						<xsl:call-template name="ITEM_DETAILS"><xsl:with-param name="label">Associated Item:          </xsl:with-param><xsl:with-param name="value"><xsl:value-of select="ASSOCIATED_ITEM"/></xsl:with-param></xsl:call-template>
						<xsl:call-template name="ITEM_DETAILS"><xsl:with-param name="label">Error_Display_Location:   </xsl:with-param><xsl:with-param name="value"><xsl:value-of select="ERROR_DISPLAY_LOCATION"/></xsl:with-param></xsl:call-template> 
					</table>

				</td>
			</tr>
		</table>
		<table width="100%" cellpadding="0" cellspacing="0"><tr><td class="procline">t</td><td width="50%">&#160;</td></tr></table>
		</xsl:element>
	</xsl:template>
	
	<xsl:template match="BRANCH">
	<xsl:element name="div">
		<xsl:attribute name="id">branch<xsl:value-of select="@JS_ID"/></xsl:attribute>
		<table width="95%" class="processaccept" cellpadding="0" cellspacing="0" align="center">
			<tr>
				<td class="processtitle" width="10%" nowrap="nowrap">
					<span class="regiontitletext">Branch:</span>
				</td>
				<td class="processtitle" align="right">
					<span class="regiontype">[<xsl:value-of select="BRANCH_TYPE"/>]</span>
				</td>
			</tr>
			
			
			<tr>
				<td colspan="2">
					<table width="100%" cellpadding="0" cellspacing="0">
						<xsl:call-template name="ITEM_DETAILS"><xsl:with-param name="label">Action:        </xsl:with-param><xsl:with-param name="value"><xsl:value-of select="BRANCH_ACTION"/></xsl:with-param></xsl:call-template>
						<xsl:call-template name="ITEM_DETAILS"><xsl:with-param name="label">Point:         </xsl:with-param><xsl:with-param name="value"><xsl:value-of select="BRANCH_POINT"/></xsl:with-param></xsl:call-template>
						<xsl:call-template name="ITEM_DETAILS"><xsl:with-param name="label">When Button Pressed:</xsl:with-param><xsl:with-param name="value"><xsl:value-of select="BRANCH_WHEN_BUTTON_ID"/></xsl:with-param></xsl:call-template>
						<xsl:call-template name="ITEM_DETAILS"><xsl:with-param name="label">Sequence:      </xsl:with-param><xsl:with-param name="value"><xsl:value-of select="BRANCH_SEQUENCE"/></xsl:with-param></xsl:call-template>
						<xsl:call-template name="ITEM_DETAILS"><xsl:with-param name="label">Clear Page Cache:     </xsl:with-param><xsl:with-param name="value"><xsl:value-of select="CLEAR_PAGE_CACHE"/></xsl:with-param></xsl:call-template>
						<xsl:call-template name="ITEM_DETAILS"><xsl:with-param name="label">Condition Type:</xsl:with-param><xsl:with-param name="value"><xsl:value-of select="BRANCH_CONDITION_TYPE"/></xsl:with-param></xsl:call-template>
						<xsl:call-template name="ITEM_DETAILS"><xsl:with-param name="label">Condition:     </xsl:with-param><xsl:with-param name="value"><xsl:value-of select="BRANCH_CONDITION"/></xsl:with-param></xsl:call-template>
						<xsl:call-template name="ITEM_DETAILS"><xsl:with-param name="label">Condition Text:</xsl:with-param><xsl:with-param name="value"><xsl:value-of select="BRANCH_CONDITION_TEXT"/></xsl:with-param></xsl:call-template>
						<xsl:call-template name="ITEM_DETAILS"><xsl:with-param name="label">Option:       </xsl:with-param><xsl:with-param name="value"><xsl:value-of select="REQUIRED_PATCH"/></xsl:with-param></xsl:call-template>
						<xsl:call-template name="ITEM_DETAILS"><xsl:with-param name="label">Comment:       </xsl:with-param><xsl:with-param name="value"><xsl:value-of select="BRANCH_COMMENT"/></xsl:with-param></xsl:call-template>
						<xsl:call-template name="ITEM_DETAILS"><xsl:with-param name="label">Last Updated:      </xsl:with-param><xsl:with-param name="value"><xsl:value-of select="LAST_UPDATED_BY"/> - <xsl:value-of select="LAST_UPDATED_ON"/></xsl:with-param></xsl:call-template>
						<xsl:call-template name="ITEM_DETAILS"><xsl:with-param name="label">Security Scheme:      </xsl:with-param><xsl:with-param name="value"><xsl:value-of select="SECURITY_SCHEME"/></xsl:with-param></xsl:call-template>  
					</table>

				</td>
			</tr>
		</table>
		<table width="100%" cellpadding="0" cellspacing="0"><tr><td class="procline">t</td><td width="50%">&#160;</td></tr></table>
		</xsl:element>
	</xsl:template>
	
	<xsl:template match="COMPUTATION">
	<xsl:element name="div">
		<xsl:attribute name="id">computation<xsl:value-of select="@JS_ID"/></xsl:attribute>
		<table width="95%" class="processaccept" cellpadding="0" cellspacing="0" align="center">
			<tr>
				<td class="processtitle" width="10%" nowrap="nowrap">
					<span class="regiontitletext">Computation: <xsl:value-of select="COMPUTATION_ITEM"/></span>
				</td>
				<td class="processtitle" align="right">
					<span class="regiontype">[<xsl:value-of select="COMPUTATION_TYPE"/>]</span>
				</td>
			</tr>
			
			
			<tr>
				<td colspan="2">
					<table width="100%" cellpadding="0" cellspacing="0">
						<xsl:call-template name="ITEM_DETAILS"><xsl:with-param name="label">Sequence:      </xsl:with-param><xsl:with-param name="value"><xsl:value-of select="COMPUTATION_SEQUENCE"/></xsl:with-param></xsl:call-template>
						<xsl:call-template name="ITEM_DETAILS"><xsl:with-param name="label">Item:          </xsl:with-param><xsl:with-param name="value"><xsl:value-of select="COMPUTATION_ITEM"/></xsl:with-param></xsl:call-template>
						<xsl:call-template name="ITEM_DETAILS"><xsl:with-param name="label">Point:         </xsl:with-param><xsl:with-param name="value"><xsl:value-of select="COMPUTATION_POINT"/></xsl:with-param></xsl:call-template>
						<xsl:call-template name="ITEM_DETAILS"><xsl:with-param name="label">Item Type:     </xsl:with-param><xsl:with-param name="value"><xsl:value-of select="COMPUTATION_ITEM_TYPE"/></xsl:with-param></xsl:call-template>
						<xsl:call-template name="ITEM_DETAILS"><xsl:with-param name="label">Type:          </xsl:with-param><xsl:with-param name="value"><xsl:value-of select="COMPUTATION_TYPE"/></xsl:with-param></xsl:call-template>
						<xsl:call-template name="ITEM_DETAILS"><xsl:with-param name="label">Processed:     </xsl:with-param><xsl:with-param name="value"><xsl:value-of select="COMPUTATION_PROCESSED"/></xsl:with-param></xsl:call-template>
						<xsl:call-template name="ITEM_DETAILS"><xsl:with-param name="label">Computation:               </xsl:with-param><xsl:with-param name="value"><xsl:value-of select="COMPUTATION"/></xsl:with-param></xsl:call-template>
						<xsl:call-template name="ITEM_DETAILS"><xsl:with-param name="label">Comment:       </xsl:with-param><xsl:with-param name="value"><xsl:value-of select="COMPUTATION_COMMENT"/></xsl:with-param></xsl:call-template>
						<xsl:call-template name="ITEM_DETAILS"><xsl:with-param name="label">Compute When:              </xsl:with-param><xsl:with-param name="value"><xsl:value-of select="COMPUTE_WHEN"/></xsl:with-param></xsl:call-template>
						<xsl:call-template name="ITEM_DETAILS"><xsl:with-param name="label">Compute When Type:         </xsl:with-param><xsl:with-param name="value"><xsl:value-of select="COMPUTE_WHEN_TYPE"/></xsl:with-param></xsl:call-template>
						<xsl:call-template name="ITEM_DETAILS"><xsl:with-param name="label">Compute When Text:         </xsl:with-param><xsl:with-param name="value"><xsl:value-of select="COMPUTE_WHEN_TEXT"/></xsl:with-param></xsl:call-template>
						<xsl:call-template name="ITEM_DETAILS"><xsl:with-param name="label">Error Message: </xsl:with-param><xsl:with-param name="value"><xsl:value-of select="COMPUTATION_ERROR_MESSAGE"/></xsl:with-param></xsl:call-template>
						<xsl:call-template name="ITEM_DETAILS"><xsl:with-param name="label">Build Option:            </xsl:with-param><xsl:with-param name="value"><xsl:value-of select="REQUIRED_PATCH"/></xsl:with-param></xsl:call-template>
						<xsl:call-template name="ITEM_DETAILS"><xsl:with-param name="label">Last Updated:           </xsl:with-param><xsl:with-param name="value"><xsl:value-of select="LAST_UPDATED_BY"/> - <xsl:value-of select="LAST_UPDATED_ON"/></xsl:with-param></xsl:call-template>
						<xsl:call-template name="ITEM_DETAILS"><xsl:with-param name="label">Security Scheme:           </xsl:with-param><xsl:with-param name="value"><xsl:value-of select="SECURITY_SCHEME"/></xsl:with-param></xsl:call-template> 
					</table>
				</td>
			</tr>
		</table>
		<table width="100%" cellpadding="0" cellspacing="0"><tr><td class="procline">t</td><td width="50%">&#160;</td></tr></table>
		</xsl:element>
	</xsl:template>
	
	<xsl:template name="ITEM_DETAILS">
		<xsl:param name="label"/>
		<xsl:param name="value"/>
		<xsl:if test="string-length($value) &gt; 0 and $value !=' - ' ">
		<tr><td class="itemlabel" nowrap="nowrap"><xsl:value-of select="$label"/></td><td class="item"><xsl:value-of select="$value"/></td></tr>
		</xsl:if>
	</xsl:template>
	
	<xsl:template name="ITEM_CODE">
		<xsl:param name="label"/>
		<xsl:param name="value"/>
		<xsl:if test="string-length($value) &gt; 0">
			<tr><td class="itemlabel" nowrap="nowrap" valign="top"><xsl:value-of select="$label"/></td><td class="code" nowrap="wrap"><xsl:value-of disable-output-escaping="yes" select="$value"/></td></tr>	
		</xsl:if>
	</xsl:template>
	
	<xsl:template name="PAGE_DETAILS">
		<xsl:param name="label"/>
		<xsl:param name="value"/>
		<xsl:if test="string-length($value) &gt; 0 and $value != ' - ' ">
			<tr><td class="pagesubtitle1" nowrap="nowrap"><xsl:value-of select="$label"/></td><td class="pagesubtitle2"><xsl:value-of select="$value"/></td></tr>
		</xsl:if>
	</xsl:template>
	
	<xsl:template name="REGION_DETAILS">
		<xsl:param name="label"/>
		<xsl:param name="value"/>
		<xsl:if test="string-length($value) &gt; 0 and $value != ' - ' ">
		<tr>
		<td style="color:#6699cc; font-size:8pt; font-weight:normal;text-align:right; width:10%;" nowrap="nowrap"><xsl:value-of select="$label"/></td>
			<td style="color:#000000; font-size:8pt; font-weight:normal; text-align:left; width:90%;padding-left:5px;"><xsl:value-of select="$value"/></td></tr>
		</xsl:if>
	</xsl:template>
	
	<xsl:template name="ITEM_HELP">
		<xsl:param name="name"/>
		<xsl:param name="help"/>
		<xsl:choose>
			<xsl:when test="position() mod 2 = 0">
				<tr><td class="itemhelpeven" nowrap="nowrap"><xsl:value-of select="$name"/></td><td class="itemhelptexteven"><xsl:value-of disable-output-escaping="yes" select="$help"/></td></tr>	
			</xsl:when>
			<xsl:otherwise>
				<tr><td class="itemhelpodd" nowrap="nowrap"><xsl:value-of select="$name"/></td><td class="itemhelptextodd"><xsl:value-of disable-output-escaping="yes" select="$help"/></td></tr>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:template>
	
	<xsl:template match="ACTION">
		<tr>
			<td class="summaryvalue" nowrap="nowrap"><xsl:value-of select="@DEVELOPER"/></td>
			<td class="summaryvalue" nowrap="nowrap"><xsl:value-of select="@DATE"/></td>
			<td class="summaryvalue" nowrap="nowrap"><xsl:value-of select="@FLOW_ATTRIBUTE"/></td>
			<td class="summaryvalue" nowrap="nowrap"><xsl:value-of disable-output-escaping="yes" select="@ACTION"/></td>
			<td class="summaryvalue" nowrap="nowrap"><xsl:value-of select="@PK"/></td>
			<td>&#160;</td>
		</tr>
	</xsl:template>
	
	
	</xsl:stylesheet>
