<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
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
        </div>
       </div>
      </div>
     </xsl:if>
    </form>
   </body>
  </html>
 </xsl:template>
</xsl:stylesheet>