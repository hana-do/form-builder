<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
  <xsl:output doctype-system="about:legacy-compat" encoding="utf-8" method="html">
  </xsl:output>
  <xsl:template match="/page">
    <html>
      <!-- variables from StateInfo for local test -->
      <xsl:variable name="viewer" select="StateInfo/Client/Type">
      </xsl:variable>
      <xsl:variable name="queue" select="StateInfo/Client/CurrentQueueName">
      </xsl:variable>
      <head>
        <xsl:if test="$viewer != 'WebNow'">
          <meta content="ie-edge;" http-equiv="x-ua-compatible"/>
          <meta content="width=device-width, initial-scale=1.0" name="viewport"/>
          <style><!-- iPhone Jumping Issue -->
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
      <!-- javascript -->
      <script language="JavaScript" src="ARCC.js" type="text/javascript">
      </script>
      <script language="JavaScript" src="jquery-2.1.0.min.js" type="text/javascript">
      </script>
      <script language="JavaScript" src="frameworkSetup.js" type="text/javascript">
      </script>
      <script language="JavaScript" src="sharedResources.js" type="text/javascript">
      </script>
      <xsl:if test="$viewer != 'WebNow'">
        <script language="JavaScript" src="framework.js" type="text/javascript">
        </script>
        <link href="framework.css" rel="stylesheet"/>
        <link href="ARCC.css" rel="stylesheet" type="text/css"/>
      </xsl:if>
      <!-- login script -->
      <xsl:if test="$viewer = 'FormViewer'">
        <script language="JavaScript" src="Authenticate.js" type="text/javascript">
        </script>
        <link href="Authenticate.css" rel="stylesheet" type="text/css"/>
      </xsl:if>
      <!-- form load -->
      <script>
        function formLoad() {
        var clientType = '<xsl:value-of select="StateInfo/Client/Type"/>';
        var currentQueue = '<xsl:value-of select="StateInfo/CurrentQueueName"/>';
        var formTitle = '<xsl:value-of select="//page/formTitle"/>';

        <xsl:if test="$viewer = 'FormViewer'">
          if(clientType == "FormViewer") {
          if(typeof(formViewerApplet) == "object" &amp;&amp;
          typeof(formViewerApplet.setSaveButtonEnabled) == "function") {
          formViewerApplet . setSaveButtonEnabled(false);
          }
          runAnalytics(clientType);
          }
        </xsl:if>

        var isMobile = devices();

        if(clientType == "FormViewer" || clientType == "ImageNow") {
        if (isMobile.any()) {
        runMobileSetup(clientType, formTitle, isMobile);
        }
        else {
        runDesktopSetup(clientType, formTitle, isMobile);
        }
        }
        else if(clientType == "WebNow") {
        webNowFormSetup(clientType, formTitle);
        }

        if (clientType != "FormViewer") {
        var allowedElements = {
        '' : [''],
        'any' : ['bypassFormLocking']
        };
        disableElements(allowedElements, clientType, currentQueue);
        }
        else {
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
                  <!-- Logo & Header -->
                  <!-- LOGIN -->
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
                              <input type="text" name="starId" id="starId" class="idleField" dbCall_param="1"
                                     dbCall="eForm_StarId_Authenticate_Mnscu_CLI" onfocus="setActiveField(this);"
                                     onblur="setInactiveField(this);" required="true">
                                <xsl:attribute name="value">
                                  <xsl:value-of select="//page/login/starId"/>
                                </xsl:attribute>
                              </input>
                            </div>
                            <!-- password -->
                            <div class="small-12 columns">
                              <label for="starId">Star ID Password:</label>
                              <br/>
                              <input type="password" name="starPassword" id="starPassword" class="idleField"
                                     dbCall_param="2" dbCall="eForm_StarId_Authenticate_Mnscu_CLI"
                                     onfocus="setActiveField(this);" onblur="setInactiveField(this);"
                                     onKeyPress="return loginSubmitter(this, event);" required="true"/>
                            </div>
                            <!-- message -->
                            <div class="small-12 columns">
                              <span id="loginMessage" style="color: #FF1414;"/>
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
                          <input type="button" id="btnRunAuthentication" style="display:none;"
                                 dbCall_onClick="eForm_StarId_Authenticate_MSU_CLI"/>
                          <input type="hidden" id="authFunction" name="authFunction" value="AuthAndLookup"
                                 dbCall_param="5" dbCall="eForm_StarId_Authenticate_MSU_CLI"/>
                          <input type="hidden" id="curAttempts" nam="curAttempts" value="1"/>
                          <input type="hidden" id="enableSaveOnAuth" name="enableSaveOnAuth" value="AuthOnly"/>
                          <input type="hidden" id="formName" name="formName" value="arccCertificate" dbCall_param="4"
                                 dbCall="eForm_StarId_Authenticate_MSU_CLI"/>
                          <input type="hidden" id="hdnReturnAuthenticationValue" name="hdnReturnAuthenticationValue"
                                 dbSet="eForm_StarId_Authenticate_MSU_CLI" dbSet_param="1"/>
                          <input type="hidden" id="maxAttemptsAuthAndLookup" name="maxAttemptsAuthAndLookup" value="3"/>
                          <input type="hidden" id="maxAttemptsAuthOnly" name="maxAttemptsAuthOnly" value="10"/>
                          <input type="hidden" id="rcId" name="rcId" value="0075" dbCall_param="3"
                                 dbCall="eForm_StarId_Authenticate_MSU_CLI"/>
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
                        </fieldset>
                      </div>
                    </div>
                  </div>
                  <!-- BODY -->
                  <div id="formSection" style="display:none;">
                    <!-- display if not formviewer -->
                    <xsl:if test="$viewer != 'FormViewer'">
                      <xsl:attribute name="style">display: block;</xsl:attribute>
                    </xsl:if>
                    <!-- general info -->
                    <div class="row" id="general-info">
                      <div class="small-12 columns">
                        <xsl:if test="$viewer != 'FormViewer'">
                          <xsl:attribute name="style">display:none;</xsl:attribute>
                        </xsl:if>
                      </div>
                    </div>
                    <!-- asterisk -->
                    <div class="row">
                      <div class="small-12 columns">
                        <p>
                          A
                          <img alt="required"
                               src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAASCAYAAABSO15qAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3QsPDhss3LcOZQAAAU5JREFUOMvdkzFLA0EQhd/bO7iIYmklaCUopLAQA6KNaawt9BeIgnUwLHPJRchfEBR7CyGWgiDY2SlIQBT/gDaCoGDudiy8SLwkBiwz1c7y+GZ25i0wnFEqlSZFZKGdi8iiiOR7aU32QkR2c7ncPcljAARAkgckb8IwrGf1fg/oJ8lRAHkR2VDVmOQ8AKjqY1bMHgCGYXhFchnAg6omJGcBXEZRtNoXYK2dMsaMt1qtD9/3p40x5yS9tHICYF1Vn0mOxXH8Uq/Xb389wff9PQDbQRB0t/QNOiPZ1h4B2MoO0fxnYz8dOOcOVbWhqq8kJzzPa3RAXZIkawCenHMjJN/+GiIqlcoFgKKq3pEMAMwAuCa5VK1W3SAfbAIopum+cy5KzwXn3M5AI6XVYlVt1mq1U8/zTlS1CeC9j2+6o1wuz1lrVzpWXLDWTg3pz/0CQnd2Jos49xUAAAAASUVORK5CYII="/>
                          indicates required information
                        </p>
                      </div>
                    </div>
                    <div id="student-info">
                      <div class="headingBar" id="custom-1">Student Information</div>
                      <div class="row columns" id="student-info-content">
                        <div class="small-12 medium-6 large-4 columns" id="col-1">
                          <label for="firstName">First Name:</label>
                          <br></br>
                          <input id="firstName" name="firstName" readonly="True" required="True" type="text">
                            <xsl:attribute name="value">
                              <xsl:value-of select="//page/firstName"/>
                            </xsl:attribute>
                          </input>
                        </div>
                        <div class="small-12 medium-6 large-4 columns" id="col-2">
                          <label for="middleName">Middle Name:</label>
                          <br></br>
                          <input id="middleName" name="middleName" readonly="True" required="False" type="text">
                            <xsl:attribute name="value">
                              <xsl:value-of select="//page/middleName"/>
                            </xsl:attribute>
                          </input>
                        </div>
                        <div class="small-12 medium-6 large-4 columns" id="col-3">
                          <label for="lastName">Last Name:</label>
                          <br></br>
                          <input id="lastName" name="lastName" readonly="True" required="True" type="text">
                            <xsl:attribute name="value">
                              <xsl:value-of select="//page/lastName"/>
                            </xsl:attribute>
                          </input>
                        </div>
                        <div class="small-12 medium-6 large-4 columns" id="col-4">
                          <label for="techId">Tech ID:</label>
                          <br></br>
                          <input id="techId" name="techId" readonly="True" required="True" type="text">
                            <xsl:attribute name="value">
                              <xsl:value-of select="//page/techId"/>
                            </xsl:attribute>
                          </input>
                        </div>
                        <div class="small-12 medium-6 large-4 columns" id="col-5">
                          <label for="starId">Star ID:</label>
                          <br></br>
                          <input id="starId" name="starId" readonly="True" required="True" type="text">
                            <xsl:attribute name="value">
                              <xsl:value-of select="//page/login/starId"/>
                            </xsl:attribute>
                          </input>
                        </div>
                        <div class="small-12 medium-6 large-4 columns" id="col-6">
                          <label for="email">Email Address:</label>
                          <br></br>
                          <input id="email" name="email" readonly="False" required="True" type="text">
                            <xsl:attribute name="value">
                              <xsl:value-of select="//page/email"/>
                            </xsl:attribute>
                          </input>
                        </div>
                        <div class="small-12 medium-6 large-4 columns" id="col-7">
                          <label for="phone">Phone Number:</label>
                          <br></br>
                          <input id="phone" name="phone" readonly="False" required="True" type="text">
                            <xsl:attribute name="value">
                              <xsl:value-of select="//page/phone"/>
                            </xsl:attribute>
                          </input>
                        </div>
                        <div class="small-12 medium-6 large-8 columns" id="col-8">
                          <label for="certName">Name as you would like it to appear on your certificate:</label>
                          <br></br>
                          <input id="certName" name="certName" readonly="False" required="True" type="text">
                            <xsl:attribute name="value">
                              <xsl:value-of select="//page/certName"/>
                            </xsl:attribute>
                          </input>
                        </div>
                      </div>
                    </div>
                    <div id="all-that-applies">
                      <div class="headingBar" id="custom-2">Please select all that applies</div>
                      <div class="row columns" id="all-that-applies-content">
                        <div class="row" id="term-year">
                          <div class="small-12 medium-8 large-8 columns" id="term">
                            <p id="term-label">
                              <img alt="required"
                                   src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAASCAYAAABSO15qAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3QsPDhss3LcOZQAAAU5JREFUOMvdkzFLA0EQhd/bO7iIYmklaCUopLAQA6KNaawt9BeIgnUwLHPJRchfEBR7CyGWgiDY2SlIQBT/gDaCoGDudiy8SLwkBiwz1c7y+GZ25i0wnFEqlSZFZKGdi8iiiOR7aU32QkR2c7ncPcljAARAkgckb8IwrGf1fg/oJ8lRAHkR2VDVmOQ8AKjqY1bMHgCGYXhFchnAg6omJGcBXEZRtNoXYK2dMsaMt1qtD9/3p40x5yS9tHICYF1Vn0mOxXH8Uq/Xb389wff9PQDbQRB0t/QNOiPZ1h4B2MoO0fxnYz8dOOcOVbWhqq8kJzzPa3RAXZIkawCenHMjJN/+GiIqlcoFgKKq3pEMAMwAuCa5VK1W3SAfbAIopum+cy5KzwXn3M5AI6XVYlVt1mq1U8/zTlS1CeC9j2+6o1wuz1lrVzpWXLDWTg3pz/0CQnd2Jos49xUAAAAASUVORK5CYII="></img>
                              <span>1. Term and Year you intend to complete your certification:</span>
                            </p>
                            <div class="row columns" id="row-4">
                              <div class="small-12 medium-4 large-4 columns">
                                <div id="">
                                  <input type="radio" name="termRadio" id="spring"
                                         onclick="setRadioValue('Spring', 'term')">
                                    <xsl:if test="//page/term='Spring'">
                                      <xsl:attribute name="checked">true</xsl:attribute>
                                    </xsl:if>
                                  </input>
                                  <label for="spring">Spring</label>
                                </div>
                              </div>
                              <div class="small-12 medium-4 large-4 columns">
                                <div id="">
                                  <input type="radio" name="termRadio" id="fall"
                                         onclick="setRadioValue('Fall', 'term')">
                                    <xsl:if test="//page/term='Fall'">
                                      <xsl:attribute name="checked">true</xsl:attribute>
                                    </xsl:if>
                                  </input>
                                  <label for="fall">Fall</label>
                                </div>
                              </div>
                              <div class="small-12 medium-4 large-4 columns">
                                <div id="">
                                  <input type="radio" name="termRadio" id="summer"
                                         onclick="setRadioValue('Summer', 'term')">
                                    <xsl:if test="//page/term='Summer'">
                                      <xsl:attribute name="checked">true</xsl:attribute>
                                    </xsl:if>
                                  </input>
                                  <label for="summer">Summer</label>
                                  <input id="term" name="term" type="hidden">
                                    <xsl:attribute name="value">
                                      <xsl:value-of select="//page/term"/>
                                    </xsl:attribute>
                                  </input>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div class="small-12 medium-4 large-4 columns" id="col-10">
                            <label for="year">Year:</label>
                            <br></br>
                            <input id="year" name="year" readonly="False" required="True" type="text">
                              <xsl:attribute name="value">
                                <xsl:value-of select="//page/year"/>
                              </xsl:attribute>
                            </input>
                          </div>
                        </div>
                        <div class="row" id="campus-sect">
                          <div class="small-12 medium-12 large-12 columns" id="campus">
                            <p id="term-label">
                              <img alt="required"
                                   src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAASCAYAAABSO15qAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3QsPDhss3LcOZQAAAU5JREFUOMvdkzFLA0EQhd/bO7iIYmklaCUopLAQA6KNaawt9BeIgnUwLHPJRchfEBR7CyGWgiDY2SlIQBT/gDaCoGDudiy8SLwkBiwz1c7y+GZ25i0wnFEqlSZFZKGdi8iiiOR7aU32QkR2c7ncPcljAARAkgckb8IwrGf1fg/oJ8lRAHkR2VDVmOQ8AKjqY1bMHgCGYXhFchnAg6omJGcBXEZRtNoXYK2dMsaMt1qtD9/3p40x5yS9tHICYF1Vn0mOxXH8Uq/Xb389wff9PQDbQRB0t/QNOiPZ1h4B2MoO0fxnYz8dOOcOVbWhqq8kJzzPa3RAXZIkawCenHMjJN/+GiIqlcoFgKKq3pEMAMwAuCa5VK1W3SAfbAIopum+cy5KzwXn3M5AI6XVYlVt1mq1U8/zTlS1CeC9j2+6o1wuz1lrVzpWXLDWTg3pz/0CQnd2Jos49xUAAAAASUVORK5CYII="></img>
                              <span>2. Campus you intend to complete your certification from:</span>
                            </p>
                            <div class="row columns" id="row-6">
                              <div class="small-12 medium-6 large-6 columns">
                                <div id="">
                                  <input type="radio" name="campusRadio" id="cambridge"
                                         onclick="setRadioValue('Cambridge (5005)', 'campus')">
                                    <xsl:if test="//page/campus='Cambridge (5005)'">
                                      <xsl:attribute name="checked">true</xsl:attribute>
                                    </xsl:if>
                                  </input>
                                  <label for="cambridge">Cambridge (5005)</label>
                                </div>
                              </div>
                              <div class="small-12 medium-6 large-6 columns">
                                <div id="">
                                  <input type="radio" name="campusRadio" id="coon"
                                         onclick="setRadioValue('Coon Rapids (5004)', 'campus')">
                                    <xsl:if test="//page/campus='Coon Rapids (5004)'">
                                      <xsl:attribute name="checked">true</xsl:attribute>
                                    </xsl:if>
                                  </input>
                                  <label for="coon">Coon Rapids (5004)</label>
                                  <input id="campus" name="campus" type="hidden">
                                    <xsl:attribute name="value">
                                      <xsl:value-of select="//page/campus"/>
                                    </xsl:attribute>
                                  </input>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div class="row" id="catalog-sect">
                          <div class="small-12 medium-12 large-12 columns" id="catalog">
                            <p id="term-label">
                              <img alt="required"
                                   src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAASCAYAAABSO15qAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3QsPDhss3LcOZQAAAU5JREFUOMvdkzFLA0EQhd/bO7iIYmklaCUopLAQA6KNaawt9BeIgnUwLHPJRchfEBR7CyGWgiDY2SlIQBT/gDaCoGDudiy8SLwkBiwz1c7y+GZ25i0wnFEqlSZFZKGdi8iiiOR7aU32QkR2c7ncPcljAARAkgckb8IwrGf1fg/oJ8lRAHkR2VDVmOQ8AKjqY1bMHgCGYXhFchnAg6omJGcBXEZRtNoXYK2dMsaMt1qtD9/3p40x5yS9tHICYF1Vn0mOxXH8Uq/Xb389wff9PQDbQRB0t/QNOiPZ1h4B2MoO0fxnYz8dOOcOVbWhqq8kJzzPa3RAXZIkawCenHMjJN/+GiIqlcoFgKKq3pEMAMwAuCa5VK1W3SAfbAIopum+cy5KzwXn3M5AI6XVYlVt1mq1U8/zTlS1CeC9j2+6o1wuz1lrVzpWXLDWTg3pz/0CQnd2Jos49xUAAAAASUVORK5CYII="></img>
                              <span>3. According to the college catalog, you may choose to fulfill degree requirements
                                outlined in any single catalog under which you have been enrolled, provided the catalog
                                was in effect no more than four years preceding the date of completion.
                              </span>
                            </p>
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
