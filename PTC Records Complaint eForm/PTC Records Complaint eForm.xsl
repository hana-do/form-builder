<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
  <xsl:output doctype-system="about:legacy-compat" encoding="utf-8" method="html">
  </xsl:output>
  <xsl:template match="/page">
    <html>
      <!-- variables from StateInfo for local test -->
      <xsl:variable name="viewer" select="StateInfo/Client/Type">
      </xsl:variable>
      <xsl:variable name="queue" select="StateInfo/CurrentQueueName">
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
      <script language="JavaScript" src="ptcComplaint.js" type="text/javascript">
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
        <link href="ptcComplaint.css" rel="stylesheet" type="text/css"/>
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
            '' : [''],
            'any' : ['bypassFormLocking']
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
                  <div id="logo-header"><div class="row"><div align="center" class="columns"><img alt="Pine Technical &amp; Community College" src="Logo.jpg"></img></div></div><div class="row"><div class="columns"><h1>Student Complaint Form</h1></div></div></div>
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
                            <div class="small-12 columns">
                              <label for="starId">Star ID:</label>
                              <br/>
                              <input type="text" name="starId" id="starId" class="idleField" dbCall_param="1" dbCall="eForm_StarId_Authenticate_Mnscu_CLI" onfocus="setActiveField(this);" onblur="setInactiveField(this);" required="true">
                                <xsl:attribute name="value">
                                  <xsl:value-of select="//page/login/starId"/>
                                </xsl:attribute>
                              </input>
                            </div>
                            <div class="small-12 columns">
                              <label for="starId">Star ID Password:</label>
                              <br/>
                              <input type="password" name="starPassword" id="starPassword" class="idleField" dbCall_param="2" dbCall="eForm_StarId_Authenticate_Mnscu_CLI" onfocus="setActiveField(this);" onblur="setInactiveField(this);" onKeyPress="return loginSubmitter(this, event);" required="true"/>
                            </div>
                            <div class="small-12 columns">
                              <span id="loginMessage" style="color: #FF1414;"/>
                            </div>
                          </div>
                          <button type="button" class="button" id="authLogin" name="login"><xsl:attribute name="onClick">
                              authenticateAndLookup(this, '<xsl:value-of select="StateInfo/Client/Type"/>');
                            </xsl:attribute>
                            Verify Credentials
                          </button>
                          <input type="button" id="btnRunAuthentication" style="display:none;" dbCall_onClick="eForm_StarId_Authenticate_Mnscu_CLI"/>
                          <input type="hidden" id="authFunction" name="authFunction" value="AuthAndLookup" dbCall_param="5" dbCall="eForm_StarId_Authenticate_Mnscu_CLI"/>
                          <input type="hidden" id="curAttempts" nam="curAttempts" value="1"/>
                          <input type="hidden" id="enableSaveOnAuth" name="enableSaveOnAuth" value="AuthOnly"/>
                          <input type="hidden" id="formName" name="formName" value="arccCertificate" dbCall_param="4" dbCall="eForm_StarId_Authenticate_Mnscu_CLI"/>
                          <input type="hidden" id="hdnReturnAuthenticationValue" name="hdnReturnAuthenticationValue" dbSet="eForm_StarId_Authenticate_Mnscu_CLI" dbSet_param="1"/>
                          <input type="hidden" id="maxAttemptsAuthAndLookup" name="maxAttemptsAuthAndLookup" value="3"/>
                          <input type="hidden" id="maxAttemptsAuthOnly" name="maxAttemptsAuthOnly" value="10"/>
                          <input type="hidden" id="rcId" name="rcId" value="0075" dbCall_param="3" dbCall="eForm_StarId_Authenticate_Mnscu_CLI"/>
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
                  <div id="formSection" style="display:none;">
                    <xsl:if test="$viewer != 'FormViewer'">
                      <xsl:attribute name="style">display: block;</xsl:attribute>
                    </xsl:if>
                    <div class="row" id="general-info">
                      <div class="small-12 columns">
                        <xsl:if test="$viewer != 'FormViewer'">
                          <xsl:attribute name="style">display:none;</xsl:attribute>
                        </xsl:if>
                      </div>
                      <p>Please read the policy and procedure regarding student complaints prior to submitting this form. Information can be found at http://www.pine.edu/about/public-information-and-policies/campus-policies/student-affairs/303.pdf</p>
                      <p>Reminder: Please submit any supporting documentation.</p>
                      <p>By completing this form, I acknowledge that I have read, understand, and will abide by the procedure and instructions of procedure 303 Student Complaints and Reporting.</p>
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
                    <div id="student-info"><div class="headingBar">Student Information</div><div class="row columns" id="student-info-content"><div class="small-12 medium-6 large-4 columns"><label for="lastName">Last Name:</label><br></br><input id="lastName" name="lastName" readonly="True" required="True" type="text"><xsl:attribute name="value"><xsl:value-of select="//page/lastName"/></xsl:attribute></input></div><div class="small-12 medium-6 large-4 columns"><label for="firstName">First Name:</label><br></br><input id="firstName" name="firstName" readonly="True" required="True" type="text"><xsl:attribute name="value"><xsl:value-of select="//page/firstName"/></xsl:attribute></input></div><div class="small-12 medium-6 large-4 columns"><label for="middleName">Middle Name:</label><br></br><input id="middleName" name="middleName" readonly="True" required="True" type="text"><xsl:attribute name="value"><xsl:value-of select="//page/middleName"/></xsl:attribute></input></div><div class="small-12 medium-6 large-4 columns"><label for="displayStarId">Star ID:</label><br></br><input id="displayStarId" name="displayStarId" readonly="True" required="True" type="text"><xsl:attribute name="value"><xsl:value-of select="//page/login/starId"/></xsl:attribute></input></div><div class="small-12 medium-6 large-4 columns"><label for="techId">Tech ID:</label><br></br><input id="techId" name="techId" readonly="True" required="True" type="text"><xsl:attribute name="value"><xsl:value-of select="//page/techId"/></xsl:attribute></input></div><div class="small-12 medium-6 large-4 columns"><label for="email">Email Address:</label><br></br><input id="email" name="email" required="True" type="email"><xsl:attribute name="value"><xsl:value-of select="//page/email"/></xsl:attribute></input></div><div class="small-12 medium-6 large-4 columns"><label for="phone">Phone Number:</label><br></br><input id="phone" name="phone" required="True" type="text"><xsl:attribute name="value"><xsl:value-of select="//page/phone"/></xsl:attribute></input></div><div class="small-12 medium-6 large-4 columns"><label for="streetAdd">Street Address:</label><br></br><input id="streetAdd" name="streetAdd" required="True" type="text"><xsl:attribute name="value"><xsl:value-of select="//page/streetAdd"/></xsl:attribute></input></div><div class="small-12 medium-6 large-4 columns"><label for="city">City:</label><br></br><input id="city" name="city" required="True" type="text"><xsl:attribute name="value"><xsl:value-of select="//page/city"/></xsl:attribute></input></div><div class="small-12 medium-6 large-4 columns"><label for="state">State:</label><br></br><input id="state" name="state" required="True" type="text"><xsl:attribute name="value"><xsl:value-of select="//page/state"/></xsl:attribute></input></div><div class="small-12 medium-6 large-4 columns"><label for="zip">Zip:</label><br></br><input id="zip" name="zip" required="True" type="text"><xsl:attribute name="value"><xsl:value-of select="//page/zip"/></xsl:attribute></input></div><div class="small-12 medium-6 large-4 columns"><label for="complaintAgainst">Complaint filed against (Instructor Name):</label><br></br><input id="complaintAgainst" name="complaintAgainst" required="True" type="text"><xsl:attribute name="value"><xsl:value-of select="//page/complaintAgainst"/></xsl:attribute></input></div><div id="hidden-info" style="display:none;"><div class="small-12 medium-6 large-4 columns"><label for="fullName">Full Name:</label><br></br><input id="fullName" name="fullName" readonly="True" type="hidden"><xsl:attribute name="value"><xsl:value-of select="//page/fullName"/></xsl:attribute></input></div></div></div></div>
                    <div id="complaint-info"><div class="headingBar">Complaint Detail</div><div class="row columns" id="complaint-info-content"><div class="small-12 columns"><label for="natureOfComplaint">Describe the nature of the complaint/grievance. Be Factual - include names, dates, locations, etc.</label><br></br><textarea cols="60" id="natureOfComplaint" name="natureOfComplaint" required="True" rows="5"><xsl:value-of select="//page/natureOfComplaint"/></textarea></div><div class="small-12 columns"><label for="actionTaken">Describe the actions you have taken to resolve the issue.</label><br></br><textarea cols="60" id="actionTaken" name="actionTaken" required="True" rows="5"><xsl:value-of select="//page/actionTaken"/></textarea></div><div class="small-12 columns"><label for="resolutionRequested">Describe the resolution/action requested.</label><br></br><textarea cols="60" id="resolutionRequested" name="resolutionRequested" required="True" rows="5"><xsl:value-of select="//page/resolutionRequested"/></textarea></div></div></div>
                    <div id="sig-info">
                      <div class="headingBar" id="custom-8">Electronic Signature</div>
                      <div class="columns" id="sig-info-content">
                        <div class="columns">
                          <p id="p-6">By entering your password and clicking the box below, you consent to use electronic communications, electronic records, and electronic signatures rather than paper documents for this form.
                          </p>
                          <div id="sigPasswordDiv" class="show">
                            <xsl:variable name="signatureCheck1" select="//page/signature/signatureConfirm"/>
                            <xsl:if test="$signatureCheck1 != ''">
                              <xsl:attribute name="class">hide</xsl:attribute>
                            </xsl:if>
                            <div>
                              <div class="row">
                                <div class="small-12 medium-12 large-12 columns">
                                  <label for="sigPassword">Provide your StarID password:</label>
                                  <input type="password" name="sigPassword" required="true" id="sigPassword" dbCall_param="6" dbCall="eForm_StarId_Authenticate_Mnscu_CLI" class="focusField"/>
                                  <span class="form-error">
                                    Password required.
                                  </span>
                                </div>
                              </div>
                              <div>
                                <xsl:variable name="signatureConfirm">
                                  <xsl:value-of select="normalize-space(//page/signature/signatureConfirm)"/>
                                </xsl:variable>
                                <input type="checkbox" id="signatureConfirm" class="checkbox">
                                  <xsl:attribute name="onClick">
                                    authenticate(this, '<xsl:value-of select="StateInfo/Client/Type"/>');
                                  </xsl:attribute>
                                  <xsl:attribute name="is_checked">
                                    <xsl:value-of select="//page/signature/signatureConfirm"/>
                                  </xsl:attribute>
                                  <xsl:if test="$signatureConfirm='true'">
                                    <xsl:attribute name="CHECKED">true</xsl:attribute>
                                  </xsl:if>
                                  <xsl:if test="$viewer != 'FormViewer'">
                                    <xsl:attribute name="DISABLED">DISABLED</xsl:attribute>
                                  </xsl:if>
                                </input>
                                <label for="signatureConfirm">By checking this box, <b>I agree</b> to all electronic signature terms and conditions.
                                </label>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div id="signatureStringDiv" name="signatureStringDiv" class="hide" style="font-weight: bold;">
                          <xsl:variable name="signatureCheck2" select="//page/signature/signatureConfirm"/>
                          <xsl:if test="$signatureCheck2 != ''">
                            <xsl:attribute name="class">show</xsl:attribute>
                          </xsl:if>
                          <xsl:copy-of select="//page/signature/signatureString"/>
                        </div>
                        <div id="signatureMessageDiv" name="signatureMessageDiv" style="color: #FF1414;"/>
                        <input type="hidden" name="signatureTimestamp" id="signatureTimestamp">
                          <xsl:attribute name="value">
                            <xsl:value-of select="//page/signature/signatureTimestamp"/>
                          </xsl:attribute>
                        </input>
                        <input type="hidden" name="signatureString" id="signatureString">
                          <xsl:attribute name="value">
                            <xsl:value-of select="//page/signature/signatureString"/>
                          </xsl:attribute>
                        </input>
                      </div>
                    </div>
                    <div id="office" style="display:none;">
                      <xsl:if test="$viewer != 'FormViewer'">
                        <xsl:attribute name="style">display:block;</xsl:attribute>
                      </xsl:if>
                      <div class="fieldTable" width="100%" cellpadding="0" cellspacing="0" style="padding-top: 0px;">
                        <xsl:if test="contains($queue, 'ARCC Club Roster Incoming')">
                          <xsl:attribute name="class">fieldTable active</xsl:attribute>
                        </xsl:if>
                        <div class="headingBar" style="margin-bottom: 10px; margin-top:10px;">
                          <font color="#ffffff">Office Section</font>
                          <span class="headingBarSpan"/>
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
                            <input type="button" class="button" value="Click Here to Sign this Document" id="btnClickApprove" onClick="getUsersName(this);">
                              <xsl:if test="//page/office/adminSig != ''">
                                <xsl:attribute name="style">
                                  display:none;
                                </xsl:attribute>
                              </xsl:if>
                            </input>
                            <input type="button" id="btnGetUserInfo" style="display:none;" dbCall_onClick="eForm_User_Name_Lookup"/>
                            <input type="hidden" id="hdnReturnValue" name="hdnReturnValue" dbSet="eForm_User_Name_Lookup" dbSet_param="1"/>
                            <input type="hidden" id="userId" name="userId" dbCall_param="1" dbCall="eForm_User_Name_Lookup">
                              <xsl:attribute name="value">
                                <xsl:value-of select="StateInfo/UserName"/>
                              </xsl:attribute>
                            </input>
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