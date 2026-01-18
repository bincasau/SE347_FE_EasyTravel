import PolicyLayout from "@/components/pages/Terms&Privacy/PolicyLayout";

export default function Terms() {
  return (
    <PolicyLayout title="Terms of Use" updatedAt="January 2026">
      <p className="text-lg">
        Welcome to <strong>EasyTravel</strong>. By accessing or using our
        website and services, you agree to be bound by these Terms of Use.
      </p>

      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          1. Use of Services
        </h2>
        <p>
          EasyTravel provides online travel services including tour booking,
          hotel reservations, and travel-related information. You agree to use
          our services only for lawful purposes.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          2. User Accounts
        </h2>
        <p>
          You must provide accurate and complete information when creating an
          account. You are responsible for keeping your account credentials
          secure.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          3. Bookings and Payments
        </h2>
        <p>
          All bookings are subject to availability and confirmation. Prices,
          promotions, and discounts may change without prior notice.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          4. Cancellations and Refunds
        </h2>
        <p>
          Cancellation and refund policies may vary depending on the provider
          and will be displayed during the booking process.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          5. Intellectual Property
        </h2>
        <p>
          All content on this website (including text, images, logos, and
          software) belongs to EasyTravel and is protected by applicable laws.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          6. Limitation of Liability
        </h2>
        <p>
          EasyTravel is not liable for any damages arising from using or being
          unable to use our services.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          7. Changes to Terms
        </h2>
        <p>
          We may update these Terms at any time. Continued use of the website
          means you accept the updated version.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          8. Contact Information
        </h2>
        <p>
          Questions? Contact us at <strong>italiainlimo@gmail.com</strong>.
        </p>
      </section>
    </PolicyLayout>
  );
}
