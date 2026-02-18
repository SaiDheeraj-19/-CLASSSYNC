const getEmailTemplate = (title, message, link = 'https://classsync-one.vercel.app') => {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body { margin: 0; padding: 0; background-color: #0d0d0d; font-family: 'Arial', sans-serif; color: #e0e0e0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #1a1a1a; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.5); border: 1px solid #333; }
        .header { background-color: #000000; padding: 20px; text-align: center; border-bottom: 2px solid #00f3ff; }
        .header h1 { margin: 0; color: #ffffff; font-size: 24px; letter-spacing: 2px; text-transform: uppercase; }
        .header span { color: #facc15; } /* Neon Yellow */
        .content { padding: 30px; line-height: 1.6; }
        .message-box { background-color: #252525; padding: 20px; border-left: 4px solid #a855f7; border-radius: 4px; margin-bottom: 25px; }
        .btn-container { text-align: center; margin: 30px 0; }
        .btn { display: inline-block; padding: 12px 25px; background-color: #00f3ff; color: #000000; text-decoration: none; font-weight: bold; border-radius: 4px; text-transform: uppercase; letter-spacing: 1px; transition: background 0.3s; }
        .footer { background-color: #000000; padding: 20px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #333; }
        .icon { font-size: 24px; margin-bottom: 10px; display: block; }
    </style>
</head>
<body>
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
        <tr>
            <td align="center" style="padding: 20px 0;">
                <div class="container">
                    <!-- Header -->
                    <div class="header">
                        <h1>CLASS<span>SYNC</span></h1>
                    </div>

                    <!-- Content -->
                    <div class="content">
                        <h2 style="color: #ffffff; margin-top: 0;">${title}</h2>
                        
                        <div class="message-box">
                            ${message}
                        </div>

                        <p style="color: #cccccc;">Please login to the portal to view full details and take action.</p>

                        <!-- Action Button -->
                        <div class="btn-container">
                            <a href="${link}" class="btn">Open ClassSync</a>
                        </div>
                    </div>

                    <!-- Footer -->
                    <div class="footer">
                        <p>&copy; ${new Date().getFullYear()} ClassSync System. All rights reserved.</p>
                        <p>Department of CSE-DS | GPCET</p>
                        <p style="margin-top: 10px; font-size: 10px; color: #444;">You received this email because you are a registered student.</p>
                    </div>
                </div>
            </td>
        </tr>
    </table>
</body>
</html>
    `;
};

module.exports = { getEmailTemplate };
