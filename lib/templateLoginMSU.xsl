<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output doctype-system="about:legacy-compat" encoding="utf-8" method="html"/>
  <xsl:template match="/page">
    <html>
      <!-- variables from StateInfo for local test -->
      <xsl:variable name="viewer" select="StateInfo/Client/Type">
      </xsl:variable>
      <xsl:variable name="queue" select="StateInfo/CurrentQueueName">
      </xsl:variable>
      <head>
        <xsl:if test="$viewer != 'WebNow'">
          <meta content="ie=edge;" http-equiv="x-ua-compatible"/>
          <meta content="width=device-width, initial-scale=1.0" name="viewport"/>
          <style>
            <!-- iPhone Jumping Issue -->
            @media only screen and (min-device-width : 375px) and (max-device-width : 667px) {
              html,body {
                -webkit-overflow-scrolling : touch !important;
                overflow: auto !important;
                height: 100% !important;
              }
            }

            @media only screen and (min-device-width : 768px) and (max-device-width : 1024px) {
              html,body {
                -webkit-overflow-scrolling : touch !important;
                overflow: auto !important;
                height: 100% !important;
              }
            }
          </style>
        </xsl:if>
      </head>

      <xsl:if test="$viewer != 'WebNow'">
        <script language="JavaScript" src="jquery-2.1.0.min.js" type="text/javascript"></script>
        <script language="JavaScript" src="framework.js" type="text/javascript"></script>
      </xsl:if>
      <link href="framework.css" rel="stylesheet"/>
      <xsl:if test="$viewer = 'FormViewer'">
        <script language="JavaScript" src="Authenticate.js" type="text/javascript"></script>
        <link href="Authenticate.css" rel="stylesheet" type="text/css"/>
      </xsl:if>
      <script language="JavaScript" src="form.js" type="text/javascript"></script>
      <script language="JavaScript" src="frameworkSetup.js" type="text/javascript"></script>
      <script language="JavaScript" src="sharedResources.js" type="text/javascript"></script>
      <link href="form.css" rel="stylesheet" type="text/css"/>
      <script>
        function formLoad() {
          var clientType = '<xsl:value-of select="StateInfo/Client/Type"/>';
          var currentQueue = '<xsl:value-of select="StateInfo/CurrentQueueName"/>';
          var formTitle = '<xsl:value-of select="//page/formTitle"/>';

          <xsl:if test="$viewer = 'FormViewer'">
            if (clientType == "FormViewer") {
              if (typeof(formViewerApplet) == "object"  &amp;&amp; typeof(formViewerApplet.setSaveButtonEnabled) == "function") {
                formViewerApplet.setSaveButtonEnabled(false);
              }
              runAnalytics(clientType);
            }
          </xsl:if>

          var isMobile = devices();

          if (clientType == "FormViewer" || clientType == "ImageNow") {
            if (isMobile.any()) {
              runMobileSetup(clientType, formTitle, isMobile);
            }
            else {
              runDesktopSetup(clientType, formTitle, isMobile);
            }
          } else if(clientType == "WebNow") {
            webNowFormSetup(clientType, formTitle);
          }

          if (clientType != "FormViewer") {
            var allowedElements = {
            '' : ['adminNotes', 'btnClickApprove', 'btnGetUserInfo'],
            'any' : ['adminNotes', 'btnClickApprove', 'btnGetUserInfo']
            };
            disableElements(allowedElements, clientType, currentQueue);
          } else {
            validation();
            foundationValidation();
          }
        }
      </script>
      <body onload="formLoad();">
        <form data-abide="data-abide" data-enable-shim="true" id="form">
          <xsl:if test="$viewer != 'WebNow'">
            <div class="row">
              <div class="container" id="container">
                <div class="innerTable" id="innerTable">

                  <div id="loginSection">
                    <xsl:if test="$viewer != 'FormViewer'">
                      <xsl:attribute name="style">display: none;</xsl:attribute>
                    </xsl:if>

                    <div class="row align-center">
                      <div class="small-12 medium-10 columns">
                        <fieldset class="login">
                          <legend>Star ID Authentication</legend>
                          <div class="row">
                            <div class="small-12 columns">
                              <p>To view and complete this form you must log in with your Star ID credentials.</p>
                              <p>If you do not know your Star ID credentials please contact your school's help desk.</p>
                            </div>

                            <!-- starID -->
                            <div class="small-12 columns">
                              <label for="starId">Star ID:</label>
                              <br/>
                              <input type="text" name="starId" id="starId" class="idleField" dbCall_param="1" dbCall="eForm_StarId_Authenticate_Mnscu_CLI" onfocus="setActiveField(this);" onblur="setInactiveField(this);" required="true">
                                <xsl:attribute name="value">
                                  <xsl:value-of select="//page/login/starId"/>
                                </xsl:attribute>
                              </input>
                            </div>

                            <!-- password -->
                            <div class="small-12 columns">
                              <label for="starId">Star ID Password:</label>
                              <br/>
                              <input type="password" name="starPassword" id="starPassword" class="idleField" dbCall_param="2" dbCall="eForm_StarId_Authenticate_Mnscu_CLI" onfocus="setActiveField(this);" onblur="setInactiveField(this);" onKeyPress="return loginSubmitter(this, event);" required="true"/>
                            </div>

                            <!-- message -->
                            <div class="small-12 columns">
                              <span id="loginMessage" style="color: #FF1414;"></span>
                            </div>
                          </div>

                          <!-- login button -->
                          <button type="button" class="button" id="authLogin" name="login">
                            <xsl:attribute name="onClick">
                              authenticateAndLookup(this, '<xsl:value-of select="StateInfo/Client/Type"/>');
                            </xsl:attribute>
                            Verify Credentials
                          </button>

                          <!-- hidden funtions -->
                          <input type="button" id="btnRunAuthentication" style="display:none;" dbCall_onClick="eForm_StarId_Authenticate_MSU_CLI"/>
                          <input type="hidden" id="authFunction" name="authFunction" value="AuthAndLookup" dbCall_param="5" dbCall="eForm_StarId_Authenticate_MSU_CLI"/>
                          <input type="hidden" id="curAttempts" nam="curAttempts" value="1"/>
                          <input type="hidden" id="enableSaveOnAuth" name="enableSaveOnAuth" value="AuthOnly"/>
                          <input type="hidden" id="formName" name="formName" value="formName_abbr" dbCall_param="4" dbCall="eForm_StarId_Authenticate_MSU_CLI"/>
                          <input type="hidden" id="hdnReturnAuthenticationValue" name="hdnReturnAuthenticationValue" dbSet="eForm_StarId_Authenticate_MSU_CLI" dbSet_param="1"/>
                          <input type="hidden" id="maxAttemptsAuthAndLookup" name="maxAttemptsAuthAndLookup" value="3"/>
                          <input type="hidden" id="maxAttemptsAuthOnly" name="maxAttemptsAuthOnly" value="10"/>
                          <input type="hidden" id="rcId" name="rcId" value="schoolCode" dbCall_param="3" dbCall="eForm_StarId_Authenticate_MSU_CLI"/>

                          <input type="hidden" id="rdtoken" name="rdtoken">
                            <xsl:attribute name="value">
                              <xsl:value-of select="//page/rdtoken"/>
                            </xsl:attribute>
                          </input>
                          <input type="hidden" id="loginTimestamp" name="loginTimestamp">
                            <xsl:attribute name="value">
                              <xsl:value-of select="//page/login/loginTimestamp"/>
                            </xsl:attribute>
                          </input>
                          <input type="hidden" id="userAgent" name="userAgent" dbCall_param="7" dbCall="eForm_StarId_Authenticate_MSU_CLI">
                            <xsl:attribute name="value">
                              <xsl:value-of select="//page/login/userAgent"/>
                            </xsl:attribute>
                          </input>
                        </fieldset>
                      </div>
                    </div>
                  </div>

                  <div id="formSection" style="display:none;">
                    <xsl:if test="$viewer != 'FormViewer'">
                      <xsl:attribute name="style">display: block;</xsl:attribute>
                    </xsl:if>

                    <div class="row" id="general-info">
                      <div class="small-12 columns">
                        <xsl:if test="$viewer != 'FormViewer'">
                          <xsl:attribute name="style">display: none;</xsl:attribute>
                        </xsl:if>
                      </div>
                    </div>

                    <div class="row">
                      <div class="small-12 columns">
                        <p>
                          A
                          <img alt="required" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAASCAYAAABSO15qAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3QsPDhss3LcOZQAAAU5JREFUOMvdkzFLA0EQhd/bO7iIYmklaCUopLAQA6KNaawt9BeIgnUwLHPJRchfEBR7CyGWgiDY2SlIQBT/gDaCoGDudiy8SLwkBiwz1c7y+GZ25i0wnFEqlSZFZKGdi8iiiOR7aU32QkR2c7ncPcljAARAkgckb8IwrGf1fg/oJ8lRAHkR2VDVmOQ8AKjqY1bMHgCGYXhFchnAg6omJGcBXEZRtNoXYK2dMsaMt1qtD9/3p40x5yS9tHICYF1Vn0mOxXH8Uq/Xb389wff9PQDbQRB0t/QNOiPZ1h4B2MoO0fxnYz8dOOcOVbWhqq8kJzzPa3RAXZIkawCenHMjJN/+GiIqlcoFgKKq3pEMAMwAuCa5VK1W3SAfbAIopum+cy5KzwXn3M5AI6XVYlVt1mq1U8/zTlS1CeC9j2+6o1wuz1lrVzpWXLDWTg3pz/0CQnd2Jos49xUAAAAASUVORK5CYII="/>
                          indicates required information
                        </p>
                      </div>
                    </div>
                    <div id="office" style="display:none;">
                      <xsl:if test="$viewer != 'FormViewer'">
                        <xsl:attribute name="style">display:block;</xsl:attribute>
                      </xsl:if>
                      <div class="fieldTable" width="100%" cellpadding="0" cellspacing="0" style="padding-top: 0px;">
                        <xsl:if test="contains($queue, '')">
                          <xsl:attribute name="class">fieldTable active</xsl:attribute>
                        </xsl:if>
                        <div class="headingBar" style="margin-bottom: 10px; margin-top:10px;">
                          <font color="#ffffff">Office Section</font>
                          <span class="headingBarSpan"></span>
                        </div>
                        <div class="row small-12 columns">
                          <div class="small-12 columns">
                            <label for="adminNotes">Internal Comments:</label>
                            <br/>
                            <textarea name="adminNotes" id="adminNotes" rows="3" cols="90">
                              <xsl:value-of select="//page/office/adminNotes"/>
                            </textarea>
                          </div>
                        </div>
                        <div class="row small-12 columns">
                          <div class="small-12 medium-8 columns">
                            <label for="admin">Name:</label>
                            <br/>
                            <input type="text" name="adminSig" id="adminSig" readonly="readonly">
                              <xsl:attribute name="value">
                                <xsl:value-of select="//page/office/adminSig"/>
                              </xsl:attribute>
                            </input>
                          </div>
                          <div class="small-12 medium-4 columns">
                            <label for="adminSigDate">Date:</label>
                            <br/>
                            <input type="text" name="adminSigDate" id="adminSigDate" readonly="readonly">
                              <xsl:attribute name="value">
                                <xsl:value-of select="//page/office/adminSigDate"/>
                              </xsl:attribute>
                            </input>
                          </div>
                        </div>
                        <div class="row small-12 columns">
                          <div class="small-12 columns">
                            <xsl:if test="contains($queue, '')">
                              <input type="button" class="button" value="Click Here to Electronically Sign this Document" id="btnClickApprove" onClick="getUsersName(this);"/>
                              <input type="button" id="btnGetUserInfo" style="display:none;" dbCall_onClick="eForm_User_Name_Lookup"/>
                              <input type="hidden" id="hdnReturnValue" name="hdnReturnValue" dbSet="eForm_User_Name_Lookup" dbSet_param="1"/>
                              <input type="hidden" id="userId" name="userId" dbCall_param="1" dbCall="eForm_User_Name_Lookup">
                                <xsl:attribute name="value">
                                  <xsl:value-of select="StateInfo/UserName"/>
                                </xsl:attribute>
                              </input>
                            </xsl:if>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </xsl:if>
        </form>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>