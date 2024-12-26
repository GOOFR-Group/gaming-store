import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/cookie-policy')({
  component: Component,
})

function Component() {
  return (
    <div className="container w-full max-w-4xl mx-auto px-4 py-8 bg-background text-foreground min-h-screen">
      <h1 className="text-4xl font-bold mb-8">Cookie Policy</h1>
      <p className="mb-4">
        <strong className="font-bold">Effective Date:</strong> December 25, 2024
      </p>
      <p>
        Welcome to our Cookie Policy. We use cookies solely to enhance your
        experience on our platform by maintaining user authentication. This
        policy explains what cookies are, how we use them, and how you can
        manage them.
      </p>
      <hr className="mt-8"></hr>

      <h2 className="text-2xl font-bold mt-8 mb-4">What Are Cookies?</h2>
      <p>
        Cookies are small files stored on your device (computer or mobile) when
        you visit a website. They allow websites to remember your preferences
        and maintain specific functionalities, such as login sessions.
      </p>

      <h2 className="text-2xl font-bold mt-8 mb-4">How We Use Cookies</h2>
      <p>We only use cookies to:</p>
      <ul className="list-disc list-inside pl-5">
        <li>
          <strong className="font-bold">Authentication:</strong> Ensure that
          logged-in users can securely access their accounts and navigate the
          website without needing to log in repeatedly.
        </li>
      </ul>

      <h2 className="text-2xl font-bold mt-8 mb-4">Managing Cookies</h2>
      <p>
        As we only use essential cookies for authentication, their removal or
        blocking may affect your ability to use our website effectively.
        However, you can manage or delete cookies through your browser settings.
      </p>

      <h2 className="text-2xl font-bold mt-8 mb-4">Changes to This Policy</h2>
      <p>
        We may update this policy from time to time. Changes will be posted on
        this page with an updated effective date. We encourage you to review
        this policy regularly.
      </p>

      <h2 className="text-2xl font-bold mt-8 mb-4">Contact Us</h2>
      <p>
        If you have any questions or concerns about this policy, please contact
        us at{' '}
        <a
          className="text-primary hover:underline"
          href="mailto:help.goofrportugal@gmail.com"
        >
          help.goofrportugal@gmail.com
        </a>
        .
      </p>
    </div>
  )
}
