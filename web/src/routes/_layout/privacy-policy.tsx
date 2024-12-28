import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/privacy-policy")({
  component: Component,
});

function Component() {
  return (
    <div className="container w-full max-w-4xl mx-auto bg-background text-foreground">
      <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
      <p className="mb-4">
        <strong className="font-bold">Effective Date:</strong> December 25, 2024
      </p>
      <p>
        Welcome to our Privacy Policy. Your privacy is critically important to
        us. This document outlines how we collect, use, and protect your
        personal information while using our platform. We process your personal
        data in accordance with the General Data Protection Regulation (GDPR)
        and other applicable data protection laws.
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
        <li>To comply with legal obligations.</li>
      </ul>

      <h2 className="text-2xl font-bold mt-8 mb-4">
        Legal Basis for Processing
      </h2>
      <p>We process your personal data under the following legal bases:</p>
      <ul className="list-disc list-inside pl-5">
        <li>Your consent, where explicitly provided.</li>
        <li>
          To fulfill contractual obligations, such as processing your orders.
        </li>
        <li>To comply with legal and regulatory requirements.</li>
        <li>
          Legitimate interests, such as improving our services and ensuring
          security.
        </li>
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
          platform, under strict confidentiality agreements.
        </li>
        <li>
          In connection with a business transaction, such as a merger or
          acquisition.
        </li>
      </ul>

      <h2 className="text-2xl font-bold mt-8 mb-4">Data Protection</h2>
      <p>
        We implement security measures to protect your data, including
        encryption, secure servers, and regular audits. While we strive to
        ensure maximum security, no system can guarantee absolute protection.
      </p>

      <h2 className="text-2xl font-bold mt-8 mb-4">Your Rights</h2>
      <p>As a data subject under GDPR, you have the following rights:</p>
      <ul className="list-disc list-inside pl-5">
        <li>
          The right to access, update, or delete your personal information.
        </li>
        <li>The right to withdraw consent for data processing at any time.</li>
        <li>
          The right to restrict processing or object to certain data uses.
        </li>
        <li>
          The right to data portability, enabling you to transfer your data to
          another service.
        </li>
        <li>
          The right to file a complaint with a data protection authority if you
          believe your rights have been violated.
        </li>
      </ul>

      <h2 className="text-2xl font-bold mt-8 mb-4">Data Retention</h2>
      <p>
        We retain your personal data only for as long as necessary to fulfill
        the purposes outlined in this policy or as required by law.
      </p>

      <h2 className="text-2xl font-bold mt-8 mb-4">Changes to This Policy</h2>
      <p>
        We may update this policy from time to time. Changes will be posted on
        this page with an updated effective date. We encourage you to review
        this policy regularly.
      </p>

      <h2 className="text-2xl font-bold mt-8 mb-4">Contact Us</h2>
      <p>
        If you have any questions or concerns about this policy, or if you wish
        to exercise your rights, please contact us at{" "}
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
