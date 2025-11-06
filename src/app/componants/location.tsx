import React from 'react';

const Location: React.FC = () => {
  // Replace with your actual Google Maps embed URL
  // You can get this by going to Google Maps, searching for a location,
  // clicking 'Share', then 'Embed a map', and copying the src attribute from the iframe.
  const googleMapsEmbedUrl = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d466.5197122086118!2d90.7200709637688!3d23.954655370415527!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x37542f005da99d11%3A0xbd1cac7a7d511b62!2z4Ka24Ka-4Ka54Kaq4KeB4KawIOCmquCmvuCmn-CngeCnn-CmvuCmsOCmquCmvuCnnCDgpqvgp4Hgpp_gpqzgprIg4Kau4Ka-4Kag!5e1!3m2!1sen!2sbd!4v1762361070583!5m2!1sen!2sbd";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-800 font-sans">
      {/* Header Section */}
      <header className="py-16 bg-white shadow-lg">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
            Our Location
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Find us easily with our interactive map and detailed directions.
          </p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto py-16 px-6 lg:px-8">
        <section className="flex flex-col md:flex-row items-stretch bg-white p-10 rounded-xl shadow-xl hover:shadow-2xl transition-shadow duration-300">
          {/* Google Maps Iframe - Left Side */}
          <div className="md:w-1/2 relative h-96 w-full mb-8 md:mb-0 md:mr-10 rounded-lg overflow-hidden shadow-lg border-2 border-indigo-200">
            <iframe
              src={googleMapsEmbedUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Google Maps Location"
              className="absolute inset-0" // Ensures iframe fills the container
            ></iframe>
          </div>

          {/* Location Details - Right Side */}
          <div className="md:w-1/2 flex flex-col justify-center">
            <h2 className="text-3xl font-bold text-indigo-700 mb-6 border-b-2 border-indigo-200 pb-3">
              Come Visit Us!
            </h2>
            <div className="space-y-6 text-lg">
              <div>
                <h3 className="font-semibold text-gray-900 flex items-center mb-2">
                  <svg className="w-5 h-5 text-indigo-500 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path></svg>
                  Our Address
                </h3>
                <p className="text-gray-700">
                  123 Heritage Lane, <br />
                  Historic Town, HZ 98765 <br />
                  Country Name
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 flex items-center mb-2">
                  <svg className="w-5 h-5 text-indigo-500 mr-2" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.774a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.06-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"></path></svg>
                  Contact Us
                </h3>
                <p className="text-gray-700">
                  Phone: (123) 456-7890 <br />
                  Email: info@example.com
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 flex items-center mb-2">
                  <svg className="w-5 h-5 text-indigo-500 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l3 3a1 1 0 001.414-1.414L11 9.586V6z" clipRule="evenodd"></path></svg>
                  Opening Hours
                </h3>
                <p className="text-gray-700">
                  Monday - Friday: 9:00 AM - 5:00 PM <br />
                  Saturday: 10:00 AM - 2:00 PM <br />
                  Sunday: Closed
                </p>
              </div>
            </div>
            <button className="mt-8 self-start px-8 py-3 bg-indigo-600 text-white font-bold rounded-full shadow-lg hover:bg-indigo-700 hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-indigo-300">
              Get Directions
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Location;