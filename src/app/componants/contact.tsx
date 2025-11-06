import React from "react";

const ContactForm = () => {
  return (
    <section className="bg-green-50 py-16 px-4">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden flex flex-col md:flex-row">
        {/* Text Section */}
        <div className="md:w-1/2 bg-emerald-700 text-white p-10 flex flex-col justify-center space-y-4">
          <h2 className="text-4xl font-bold mb-2">Get in Touch</h2>
          <p className="text-lg">We value your messages and inquiries. Please fill out the form and we will respond as soon as possible. May peace and blessings be upon you.</p>
          <div className="space-y-1">
            <p><strong>Phone:</strong> +880 123 456 789</p>
            <p><strong>Location:</strong> 123 Jannatul Baqi Road, Dhaka, Bangladesh</p>
            <p><strong>Meeting Time:</strong> Saturday - Thursday, 9 AM - 5 PM</p>
          </div>
        </div>

        {/* Form Section */}
        <div className="md:w-1/2 p-10">
          <form
            action="https://formsubmit.co/m.b.siam2008@gmail.com"
            method="POST"
            className="space-y-4"
          >
            <input type="hidden" name="_captcha" value="false"  />
            <input type="hidden" name="_template" value="table"/>
            <input type="hidden" name="_next" value="https://cemeteryapi.onrender.com/thankyou" />
            <div className="flex flex-col">
              <label htmlFor="name" className="text-green-900 font-medium mb-1">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                required
                placeholder="Your full name"
                className="border text-black border-green-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>

            <div className="flex flex-col">
              <label htmlFor="email" className="text-green-900 font-medium mb-1">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                required
                placeholder="Your email address"
                className="border border-green-300 text-black rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>

            <div className="flex flex-col">
              <label htmlFor="userPhone" className="text-green-900 font-medium mb-1">Phone Number</label>
              <input
                type="tel"
                id="userPhone"
                name="userPhone"
                placeholder="Your phone number"
                className="border border-green-300 text-black rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>

            <div className="flex flex-col">
              <label htmlFor="userLocation" className="text-green-900 font-medium mb-1">Location</label>
              <input
                type="text"
                id="userLocation"
                name="userLocation"
                placeholder="Your location"
                className="border border-green-300 text-black rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>

            <div className="flex flex-col">
              <label htmlFor="meetingTime" className="text-green-900 font-medium mb-1">Preferred Meeting Time</label>
              <input
                type="text"
                id="meetingTime"
                name="meetingTime"
                placeholder="E.g., Saturday 10 AM"
                className="border border-green-300 text-black rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>

            <div className="flex flex-col">
              <label htmlFor="message" className="text-green-900 font-medium mb-1">Message</label>
              <textarea
                id="message"
                name="message"
                required
                rows={5}
                placeholder="Write your message here"
                className="border border-green-300 text-black rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-700 text-white font-semibold py-2 rounded-md hover:bg-emerald-600 transition"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default ContactForm;
