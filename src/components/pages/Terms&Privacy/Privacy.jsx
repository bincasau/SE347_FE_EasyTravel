import PolicyLayout from "@/components/pages/Terms&Privacy/PolicyLayout";

export default function Privacy() {
  return (
    <PolicyLayout title="Privacy Policy" updatedAt="January 2026">
      <p className="text-lg">
        At <strong>EasyTravel</strong>, we respect your privacy and are
        committed to protecting your personal information.
      </p>

      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          1. Information We Collect
        </h2>
        <p>
          We may collect personal information such as your name, email address,
          phone number, and booking details when you use our services.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          2. How We Use Your Information
        </h2>
        <p>
          Your information is used to process bookings, provide customer
          support, improve our services, and send important notifications.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          3. Data Protection
        </h2>
        <p>
          We apply appropriate technical and organizational measures to protect
          your personal data from unauthorized access or misuse.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          4. Sharing of Information
        </h2>
        <p>
          EasyTravel does not sell or rent personal data to third parties.
          Information is shared only with service providers required to fulfill
          bookings.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">5. Cookies</h2>
        <p>
          Our website uses cookies to enhance user experience and analyze
          website traffic. You may disable cookies in your browser settings.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          6. User Rights
        </h2>
        <p>
          You have the right to access, update, or request deletion of your
          personal data by contacting us.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          7. Changes to This Policy
        </h2>
        <p>
          This Privacy Policy may be updated periodically. Any changes will be
          posted on this page.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          8. Contact Us
        </h2>
        <p>
          For any questions regarding this Privacy Policy, please contact us at{" "}
          <strong>italiainlimo@gmail.com</strong>.
        </p>
      </section>
    </PolicyLayout>
  );
}
