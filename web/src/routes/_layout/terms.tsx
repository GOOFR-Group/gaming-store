import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/terms")({
  component: Component,
});

function Component() {
  return (
    <div className="container w-full max-w-4xl mx-auto px-4 py-8 bg-background text-foreground min-h-screen">
      <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
      <p>
        <strong className="font-bold">Effective Date:</strong> December 25, 2024
      </p>
      <p>
        Welcome to GOOFR Gaming Store! These Terms of Service ("Terms") govern
        your use of our platform and services. By accessing or using the
        website, you agree to these Terms. If you do not agree, please refrain
        from using our platform.
      </p>
      <hr className="mt-8"></hr>

      <h2 className="text-2xl font-bold mt-8 mb-4">1. Acceptance of Terms</h2>
      <p>
        By creating an account or using the platform, you acknowledge that you
        have read, understood, and agree to be bound by these Terms, along with
        our Privacy Policy.
      </p>

      <h2 className="text-2xl font-bold mt-8 mb-4">2. User Accounts</h2>
      <ul className="list-disc list-inside">
        <li>
          <strong className="font-bold">Eligibility:</strong> You must be at
          least 16 years old to create an account and use the platform.
        </li>
        <li>
          <strong className="font-bold">Accuracy:</strong> You agree to provide
          accurate and up-to-date information during account registration.
        </li>
        <li>
          <strong className="font-bold">Security:</strong> You are responsible
          for maintaining the confidentiality of your account credentials and
          for all activities conducted through your account.
        </li>
      </ul>

      <h2 className="text-2xl font-bold mt-8 mb-4">3. Use of the Platform</h2>
      <ul className="list-disc list-inside">
        <li>
          <strong className="font-bold">Permitted Use:</strong> The platform
          allows users to explore, purchase, and download games, publish
          content, and engage with community features.
        </li>
        <li>
          <strong className="font-bold">Prohibited Activities:</strong> You
          agree not to engage in any illegal, harmful, or abusive activities,
          including but not limited to:
          <ul className="list-disc list-inside pl-6">
            <li>Uploading malicious software.</li>
            <li>Violating intellectual property rights.</li>
            <li>
              Circumventing security measures or accessing restricted areas of
              the platform.
            </li>
          </ul>
        </li>
      </ul>

      <h2 className="text-2xl font-bold mt-8 mb-4">
        4. Purchases and Payments
      </h2>
      <p>
        All purchases made on the platform are final and subject to our Refund
        Policy. You are responsible for ensuring sufficient funds and adhering
        to payment provider terms.
      </p>

      <h2 className="text-2xl font-bold mt-8 mb-4">
        5. Content Ownership and Licensing
      </h2>
      <ul className="list-disc list-inside">
        <li>
          <strong className="font-bold">User-Generated Content:</strong> By
          uploading or submitting content (e.g., reviews, game publications),
          you grant us a worldwide, royalty-free license to use, display, and
          distribute your content as part of the platform.
        </li>
        <li>
          <strong className="font-bold">Intellectual Property:</strong> All
          platform assets, including design, code, and trademarks, are the
          property of GOOFR or respective owners. Unauthorized use is
          prohibited.
        </li>
      </ul>

      <h2 className="text-2xl font-bold mt-8 mb-4">6. Service Availability</h2>
      <p>
        We strive to ensure continuous access to the platform but do not
        guarantee uninterrupted service. The platform may be updated, modified,
        or discontinued without prior notice.
      </p>

      <h2 className="text-2xl font-bold mt-8 mb-4">
        7. Limitation of Liability
      </h2>
      <p>
        GOOFR is not responsible for any indirect, incidental, or consequential
        damages arising from your use of the platform. This includes, but is not
        limited to, data loss or financial loss.
      </p>

      <h2 className="text-2xl font-bold mt-8 mb-4">8. Termination</h2>
      <p>
        We reserve the right to terminate or suspend your account if you breach
        these Terms or engage in prohibited activities.
      </p>

      <h2 className="text-2xl font-bold mt-8 mb-4">9. Amendments</h2>
      <p>
        These Terms may be updated periodically. Continued use of the platform
        after changes constitutes acceptance of the new Terms.
      </p>

      <h2 className="text-2xl font-bold mt-8 mb-4">10. Governing Law</h2>
      <p>
        These Terms are governed by the laws of Portugal. Any disputes will be
        resolved exclusively in the courts of Portugal.
      </p>

      <h2 className="text-2xl font-bold mt-8 mb-4">11. Contact Us</h2>
      <p>
        For any questions about these Terms, please contact us at{" "}
        <a
          className="text-primary hover:underline"
          href="mailto:help.goofrportugal@gmail.com"
        >
          help.goofrportugal@gmail.com
        </a>
        .
      </p>
    </div>
  );
}
