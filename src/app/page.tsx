import Navigation from '@/components/Navigation'
import OurProjectsSection from '@/components/OurProjectsSection'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navigation />

      {/* Hero Section with Background Image */}
      <section className="relative h-screen bg-gray-900">
        {/* Background Image - Wind Turbines */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.6)), url('https://images.unsplash.com/photo-1466611653911-95081537e5b7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')"
          }}
        />

        {/* Hero Content */}
        <div className="relative z-10 flex items-center justify-center h-full">
          <div className="text-center text-white max-w-5xl mx-auto px-4">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Featured <span className="italic font-light">Projects</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-4xl mx-auto leading-relaxed font-light">
              Explore new and upcoming featured projects, where we highlight our most notable
              work. Every project is a testament to our commitment to excellence, innovation, and
              sustainable purpose.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
              <Link
                href="/projects"
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg text-lg font-medium transition-colors"
              >
                Explore Projects
              </Link>
              <Link
                href="/auth/signup"
                className="border-2 border-white text-white hover:bg-white hover:text-gray-900 px-8 py-4 rounded-lg text-lg font-medium transition-colors"
              >
                Start Funding
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Our Projects Section - Dynamic from Supabase */}
      <OurProjectsSection maxProjects={6} />

      {/* Testimonials Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 text-center">
            What <em className="italic">Our Clients</em> Say
          </h2>
          <p className="text-gray-600 mb-12 text-center max-w-2xl mx-auto">
            Discover what our thousands of researchers have to say about working with FundMyScience to fund
            their scientific research.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Testimonial */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="mb-6">
                <svg className="w-12 h-12 text-green-600 mb-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z" />
                </svg>
                <p className="text-gray-700 text-lg leading-relaxed mb-6">
                  Innovate Studio transformed our brand from the ground up. Their deep understanding of our vision
                  and their creative approach to design were simply unmatched. The new brand identity and website
                  have not only resonated with our audience but have also driven measurable results. We
                  couldnt be happier with the results.
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-200 rounded-full mr-4"></div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Manson Benz</h4>
                    <p className="text-gray-600 text-sm">Marketing Director at Pipeline</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Image placeholder */}
            <div className="relative">
              <div className="w-full h-96 bg-gray-200 rounded-2xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-12">
            <em className="italic">Trusted By</em>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-8 items-center opacity-60">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="w-16 h-16 bg-gray-300 rounded-full mx-auto"></div>
            ))}
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Trusted By <span className="italic font-light">Leading</span> Institutions
          </h2>
          <p className="text-gray-600 mb-12 max-w-2xl mx-auto">
            Our platform is trusted by researchers and institutions worldwide,
            fostering innovation across diverse scientific disciplines.
          </p>

          {/* Institution Logos */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 items-center">
            {[
              { name: "MIT", logo: "MIT" },
              { name: "Stanford", logo: "Stanford" },
              { name: "Harvard", logo: "Harvard" },
              { name: "Oxford", logo: "Oxford" },
              { name: "Berkeley", logo: "UC Berkeley" },
              { name: "Cambridge", logo: "Cambridge" }
            ].map((institution, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center mb-2">
                  <span className="text-xs font-semibold text-gray-600">{institution.logo}</span>
                </div>
                <span className="text-xs text-gray-500">{institution.name}</span>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mt-16">
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">500+</div>
              <div className="text-gray-600">Active Projects</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">$50M+</div>
              <div className="text-gray-600">Funds Raised</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">10K+</div>
              <div className="text-gray-600">Researchers</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">95%</div>
              <div className="text-gray-600">Success Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Contact Image */}
            <div className="relative">
              <div className="w-full h-96 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl"></div>
            </div>

            {/* Contact Form */}
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Contact Us</h2>

              <form className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">E-mail</label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter your email"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter your message"
                  />
                </div>

                <button className="w-full bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-lg font-medium">
                  Contact Us
                </button>
              </form>

              <div className="mt-8 space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900">Contact</h3>
                  <p className="text-gray-600">hi@fmscience.com</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Based in</h3>
                  <p className="text-gray-600">Los Angeles,<br />California</p>
                </div>
              </div>

              {/* Social Links */}
              <div className="flex space-x-4 mt-6">
                <a href="#" className="w-10 h-10 bg-gray-900 text-white rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-900 text-white rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.219-5.175 1.219-5.175s-.311-.623-.311-1.544c0-1.446.839-2.525 1.883-2.525.888 0 1.317.667 1.317 1.466 0 .893-.568 2.229-.861 3.467-.245 1.04.522 1.887 1.549 1.887 1.859 0 3.285-1.96 3.285-4.792 0-2.503-1.799-4.253-4.37-4.253-2.977 0-4.727 2.234-4.727 4.546 0 .9.347 1.863.78 2.388.085.103.097.194.072.299-.079.33-.254 1.037-.289 1.183-.046.189-.151.229-.35.138-1.299-.604-2.111-2.5-2.111-4.028 0-3.298 2.394-6.325 6.901-6.325 3.628 0 6.445 2.584 6.445 6.032 0 3.598-2.27 6.492-5.42 6.492-1.058 0-2.055-.549-2.394-1.275 0 0-.524 1.994-.651 2.48-.236.92-.872 2.072-1.297 2.777.978.302 2.018.461 3.085.461 6.624 0 11.99-5.367 11.99-11.987C24.007 5.367 18.641.001 12.017.001z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-4">
            Lets <em className="italic">Collaborate!</em>
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Ready to fund groundbreaking research? We are excited to hear from you! Drop
            us a line and lets discuss how we can turn your ideas into the future of science.
          </p>
          <Link
            href="/auth/signup"
            className="inline-block bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-medium"
          >
            Contact Us Today
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Logo & Description */}
            <div className="md:col-span-2">
              <Link href="/" className="text-2xl font-bold text-green-400 mb-4 block">
                FundMyScience
              </Link>
              <p className="text-gray-400 mb-4 max-w-md">
                © Creative Commons, Santa Etal, #1, Toronto,
                Canada, M6J 3T6 - 555 012 3456
                info@fundmyscience.com
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/" className="hover:text-white">Careers</Link></li>
                <li><Link href="/" className="hover:text-white">Events</Link></li>
                <li><Link href="/" className="hover:text-white">Resources</Link></li>
                <li><Link href="/" className="hover:text-white">Directory</Link></li>
              </ul>
            </div>

            {/* Follow Us */}
            <div>
              <h3 className="font-semibold mb-4">Follow Us</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/" className="hover:text-white">Linkedin</Link></li>
                <li><Link href="/" className="hover:text-white">Facebook</Link></li>
                <li><Link href="/" className="hover:text-white">Instagram</Link></li>
                <li><Link href="/" className="hover:text-white">Twitter</Link></li>
              </ul>
            </div>

            {/* Our Policies */}
            <div>
              <h3 className="font-semibold mb-4">Our Policies</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/" className="hover:text-white">Subscribe to our newsletter. It is included, advanced, fun, and
                  more than this this is some excellent additional content</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 FundMyScience Studio. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/" className="text-gray-400 hover:text-white text-sm">Privacy Policy</Link>
              <Link href="/" className="text-gray-400 hover:text-white text-sm">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
