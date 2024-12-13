package notification

import (
	"log"
	"os"

	"github.com/sendgrid/sendgrid-go"
	"github.com/sendgrid/sendgrid-go/helpers/mail"
)

func sendEmail(senderEmail, recieverEmail string) error { 
	// senderEmail is the email of the user who uploaded the file
	// recieverEmail is the email of the user who will receive the file

	filePortalEmail := os.Getenv("FILEPORTAL_EMAIL") 		
	if filePortalEmail == "" {
		log.Println("ERROR: FilePortal email not found")
		return nil
	}

	from := mail.NewEmail("FilePortal Team", filePortalEmail)
	subject := "New file received on FilePortal!"
	to := mail.NewEmail("File Recipient", recieverEmail)
	plainTextContent := `Hello,

	You have received a new file from ` + senderEmail + ` on FilePortal.
	
	Please visit the dashboard and click Shared with Me to access your file:
	https://file-portal-six.vercel.app/dashboard

	Warmly,
	FilePortal Team`	
	
	htmlContent := `
	<html>
	<body>
	<p>Hello,</p>
	<p>You have received a new file from <strong>` + senderEmail + `</strong> on FilePortal.</p>
	<p><strong>Please visit the dashboard and click <a href="https://file-portal-six.vercel.app/dashboard" target="_blank">Shared with Me</a> to access your file.</strong></p>
	<i>Alternatively, you can copy and paste the following link into your browser:
	<br>https://file-portal-six.vercel.app/dashboard</i>
	<p>Warmly,<br>FilePortal Team</p>
	</body>
	</html>
	`	

	message := mail.NewSingleEmail(from, subject, to, plainTextContent, htmlContent) // plaintext is a fallback for email clients that don't support HTML

	apiKey := os.Getenv("SENDGRID_API_KEY")
	if apiKey == "" {
		log.Println("ERROR: SendGrid API key not found")
		return nil
	}

	client := sendgrid.NewSendClient(apiKey)
	response, err := client.Send(message)

	if err != nil {
		return err
	}

	if response.StatusCode != 202 {
		log.Printf("ERROR: Email not sent to %s\n\t email client's response: %s", recieverEmail, response.Body)
	} else {
		log.Printf("INFO: Email sent to: %s\n", recieverEmail)
	}

	return nil
}
