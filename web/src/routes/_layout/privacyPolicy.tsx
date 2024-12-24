import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/privacyPolicy")({
  component: Component,
});

function Component() {
  return (
    <div className="container w-full max-w-4xl mx-auto px-4 py-8 bg-background text-foreground min-h-screen">
      <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
      <p className="mb-4">
        <strong className="font-bold">Effective Date:</strong> December 25, 2024
      </p>
      <p>
        Welcome to our Privacy Policy. Your privacy is critically important to
        us. This document outlines how we collect, use, and protect your
        personal information while using our platform.
      </p>
      <hr className="mt-8"></hr>

      <h2 className="text-2xl font-bold mt-8 mb-4">Information We Collect</h2>
      <p>We may collect the following types of information:</p>
      <ul className="list-disc list-inside pl-5">
        <li>
          <strong className="font-bold">Personal Information:</strong> Such as
          your name, email address, and payment details when you create an
          account or make a purchase.
        </li>
        <li>
          <strong className="font-bold">Usage Data:</strong> Including your
          interactions with the platform, pages visited, and features used.
        </li>
        <li>
          <strong className="font-bold">Technical Data:</strong> Such as IP
          addresses, browser types, and device information.
        </li>
      </ul>

      <h2 className="text-2xl font-bold mt-8 mb-4">
        How We Use Your Information
      </h2>
      <p>Your information is used for the following purposes:</p>
      <ul className="list-disc list-inside pl-5">
        <li>To provide and improve our services.</li>
        <li>To process transactions and manage your account.</li>
        <li>To communicate with you about updates, promotions, and support.</li>
        <li>To analyze and improve the performance of our platform.</li>
      </ul>

      <h2 className="text-2xl font-bold mt-8 mb-4">Sharing Your Information</h2>
      <p>
        We do not sell or share your personal information with third parties,
        except in the following cases:
      </p>
      <ul className="list-disc list-inside pl-5">
        <li>To comply with legal obligations.</li>
        <li>
          To trusted third-party service providers who assist in operating our
          platform.
        </li>
        <li>
          In connection with a business transaction, such as a merger or
          acquisition.
        </li>
      </ul>

      <h2 className="text-2xl font-bold mt-8 mb-4">Data Protection</h2>
      <p>
        We implement security measures to protect your data, including
        encryption, secure servers, and regular audits. However, no system is
        entirely secure, and we cannot guarantee absolute security.
      </p>

      <h2 className="text-2xl font-bold mt-8 mb-4">Your Rights</h2>
      <p>You have the right to:</p>
      <ul className="list-disc list-inside pl-5">
        <li>Access, update, or delete your personal information.</li>
        <li>Withdraw consent for data processing at any time.</li>
        <li>
          File a complaint with a data protection authority if you believe your
          rights have been violated.
        </li>
      </ul>

      <h2 className="text-2xl font-bold mt-8 mb-4">Changes to This Policy</h2>
      <p>
        We may update this policy from time to time. Changes will be posted on
        this page with an updated effective date. We encourage you to review
        this policy regularly.
      </p>

      <h2 className="text-2xl font-bold mt-8 mb-4">Contact Us</h2>
      <p>
        If you have any questions or concerns about this policy, please contact
        us at{" "}
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
