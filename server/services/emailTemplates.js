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
        .header { background: linear-gradient(90deg, #000000 0%, #1a1a1a 100%); padding: 30px 20px; text-align: center; border-bottom: 3px solid #00f3ff; }
        .header h1 { margin: 0; color: #ffffff; font-size: 28px; letter-spacing: 4px; text-transform: uppercase; text-shadow: 0 0 10px rgba(0, 243, 255, 0.5); }
        .header span { color: #facc15; } /* Neon Yellow */
        .content { padding: 40px 30px; line-height: 1.8; background-color: #1a1a1a; }
        .message-box { background-color: #2a2a2a; padding: 25px; border-left: 5px solid #a855f7; border-radius: 6px; margin-bottom: 30px; box-shadow: 0 4px 6px rgba(0,0,0,0.3); }
        .btn-container { text-align: center; margin: 40px 0; }
        .btn { display: inline-block; padding: 14px 35px; background: linear-gradient(45deg, #00f3ff, #00c2cc); color: #000000; text-decoration: none; font-weight: bold; border-radius: 50px; text-transform: uppercase; letter-spacing: 2px; transition: transform 0.2s; box-shadow: 0 0 15px rgba(0, 243, 255, 0.4); }
        .footer { background-color: #111; padding: 25px; text-align: center; font-size: 12px; color: #555; border-top: 1px solid #333; }
        .tagline { color: #a855f7; font-size: 10px; letter-spacing: 1px; margin-bottom: 10px; display: block; text-transform: uppercase; }
    </style>
</head>
<body>
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
        <tr>
            <td align="center" style="padding: 40px 0; background-color: #0d0d0d;">
                <div class="container">
                    <!-- Header -->
                    <div class="header">
                        <h1>CLASS<span>SYNC</span></h1>
                    </div>

                    <!-- Content -->
                    <div class="content">
                        <h2 style="color: #ffffff; margin-top: 0; font-size: 22px;">${title}</h2>
                        
                        <div class="message-box">
                            ${message}
                        </div>

                        <p style="color: #cccccc;">Please login to the portal to view full details and take action.</p>

                        <!-- Action Button -->
                        <div class="btn-container">
                            <a href="${link}" class="btn">Open Portal</a>
                        </div>
                    </div>

                    <!-- Footer -->
                    <div class="footer">
                        <span class="tagline">Empowered by Technology</span>
                        <p>&copy; ${new Date().getFullYear()} ClassSync System.</p>
                        <p style="color: #777; font-weight: bold;">Department of CSE | GPCET</p>
                        <p style="margin-top: 15px; font-size: 10px; color: #333;">Automated Notification System</p>
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
