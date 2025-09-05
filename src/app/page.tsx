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
            What <em className="italic">Our Researchers</em> Say
          </h2>
          <p className="text-gray-600 mb-12 text-center max-w-2xl mx-auto">
            Discover what our thousands of researchers have to say about using FundMyScience to fund
            their groundbreaking scientific research.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Testimonial */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="mb-6">
                <svg className="w-12 h-12 text-green-600 mb-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z" />
                </svg>
                <p className="text-gray-700 text-lg leading-relaxed mb-6">
                  FundMyScience revolutionized how I approach research funding. The platforms DAO governance
                  and blockchain transparency gave my renewable energy project the credibility it needed.
                  Within 3 months, I secured $250K in funding from global investors who believe in
                  sustainable technology.
                </p>
                <div className="flex items-center">
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
                    alt="Dr. Alex Chen"
                    className="w-12 h-12 rounded-full mr-4 object-cover"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900">Dr. Alex Chen</h4>
                    <p className="text-gray-600 text-sm">Renewable Energy Research, MIT</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Researcher Image */}
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=400&fit=crop"
                alt="Scientist working in laboratory"
                className="w-full h-96 object-cover rounded-2xl shadow-lg"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl"></div>
            </div>
          </div>

          {/* Additional Testimonials Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="flex items-center mb-4">
                <img
                  src="https://images.unsplash.com/photo-1494790108755-2616b332e234?w=150&h=150&fit=crop&crop=face"
                  alt="Dr. Sarah Martinez"
                  className="w-10 h-10 rounded-full mr-3 object-cover"
                />
                <div>
                  <h5 className="font-semibold text-sm">Dr. Sarah Martinez</h5>
                  <p className="text-xs text-gray-600">Climate Science, Stanford</p>
                </div>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">
                &ldquo;The milestone-based funding model helped me demonstrate progress to investors
                throughout my 18-month climate modeling project.&rdquo;
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="flex items-center mb-4">
                <img
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
                  alt="Prof. Michael Johnson"
                  className="w-10 h-10 rounded-full mr-3 object-cover"
                />
                <div>
                  <h5 className="font-semibold text-sm">Prof. Michael Johnson</h5>
                  <p className="text-xs text-gray-600">Biotechnology, Harvard</p>
                </div>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">
                &ldquo;Secured $400K for my gene therapy research. The AI evaluation system
                helped investors understand the market potential of our breakthrough.&rdquo;
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="flex items-center mb-4">
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face"
                  alt="Dr. Emily Wong"
                  className="w-10 h-10 rounded-full mr-3 object-cover"
                />
                <div>
                  <h5 className="font-semibold text-sm">Dr. Emily Wong</h5>
                  <p className="text-xs text-gray-600">AI Research, Berkeley</p>
                </div>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">
                &ldquo;The global investor network gave my quantum computing project
                the international funding it needed to compete with major labs.&rdquo;
              </p>
            </div>
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center">
            {[
              {
                name: "MIT",
                alt: "Massachusetts Institute of Technology",
                logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/MIT_logo.svg/200px-MIT_logo.svg.png"
              },
              {
                name: "Stanford",
                alt: "Stanford University",
                logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Seal_of_Leland_Stanford_Junior_University.svg/200px-Seal_of_Leland_Stanford_Junior_University.svg.png"
              },
              {
                name: "Harvard",
                alt: "Harvard University",
                logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Harvard_University_coat_of_arms.svg/200px-Harvard_University_coat_of_arms.svg.png"
              },
              {
                name: "Oxford",
                alt: "University of Oxford",
                logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Oxford-University-Circlet.svg/200px-Oxford-University-Circlet.svg.png"
              },
              {
                name: "UC Berkeley",
                alt: "UC Berkeley",
                logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Seal_of_University_of_California%2C_Berkeley.svg/200px-Seal_of_University_of_California%2C_Berkeley.svg.png"
              },
              {
                name: "Cambridge",
                alt: "University of Cambridge",
                logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/University_of_Cambridge_Logo.svg/200px-University_of_Cambridge_Logo.svg.png"
              }
            ].map((institution, i) => (
              <div key={i} className="flex flex-col items-center group">
                <div className="w-16 h-16 bg-white rounded-lg shadow-sm border border-gray-100 flex items-center justify-center mb-3 group-hover:shadow-md transition-shadow p-2">
                  <img
                    src={institution.logo}
                    alt={institution.alt}
                    className="w-full h-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300"
                  />
                </div>
                <span className="text-xs text-gray-600 font-medium text-center">{institution.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 lg:py-24 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            {/* Plant Image */}
            <div className="relative lg:pr-8">
              <img
                src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&h=800&fit=crop&auto=format"
                alt="Green plant leaves in natural light"
                className="w-full h-[500px] lg:h-[650px] object-cover rounded-2xl"
              />
            </div>

            {/* Contact Form */}
            <div className="lg:pl-8 lg:pt-8">
              <div className="mb-8">
                <h2 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight" style={{ fontFamily: 'serif' }}>Contact Us</h2>
              </div>

              <form className="space-y-8 mb-12">
                <div>
                  <input
                    type="text"
                    className="w-full px-0 py-3 border-0 border-b border-gray-400 bg-transparent focus:ring-0 focus:border-gray-800 text-lg placeholder-gray-600 transition-colors outline-none"
                    placeholder="Full Name"
                  />
                </div>

                <div>
                  <input
                    type="email"
                    className="w-full px-0 py-3 border-0 border-b border-gray-400 bg-transparent focus:ring-0 focus:border-gray-800 text-lg placeholder-gray-600 transition-colors outline-none"
                    placeholder="E-mail"
                  />
                </div>

                <div>
                  <textarea
                    rows={3}
                    className="w-full px-0 py-3 border-0 border-b border-gray-400 bg-transparent focus:ring-0 focus:border-gray-800 text-lg placeholder-gray-600 transition-colors resize-none outline-none"
                    placeholder="Message"
                  />
                </div>

                <div className="pt-4">
                  <button className="bg-black text-white px-10 py-3 rounded-full font-medium text-base hover:bg-gray-800 transition-colors">
                    Contact Us
                  </button>
                </div>
              </form>

              {/* Contact Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="font-bold text-gray-900 text-base mb-1">Contact</h3>
                  <p className="text-gray-600 text-sm">hi@green.com</p>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base mb-1">Based in</h3>
                  <p className="text-gray-600 text-sm">Los Angeles,</p>
                  <p className="text-gray-600 text-sm">California</p>
                </div>
              </div>

              {/* Social Links */}
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.374 0 0 5.373 0 12s5.374 12 12 12 12-5.373 12-12S18.626 0 12 0zm5.568 8.16c-.169 1.858-.896 3.462-2.136 4.702C14.172 14.122 12.568 14.849 10.71 15.018c-1.858.169-3.462-.558-4.702-1.798C4.748 11.96 4.021 10.356 3.852 8.498c-.169-1.858.558-3.462 1.798-4.702C6.89 2.536 8.494 1.809 10.352 1.64c1.858-.169 3.462.558 4.702 1.798 1.24 1.24 1.967 2.844 2.136 4.702z" />
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
            <div className="lg:max-w-2xl">
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'serif' }}>
                Let&apos;s <em className="italic">Collaborate!</em>
              </h2>
              <p className="text-gray-600 text-lg">
                Ready to create something amazing? We&apos;re excited to hear from you. Drop
                us a message and let&apos;s start a conversation
              </p>
            </div>
            <div className="flex-shrink-0">
              <Link
                href="/auth/signup"
                className="bg-black hover:bg-gray-800 text-white px-8 py-4 rounded-full font-medium text-lg transition-colors"
              >
                Contact Us Today
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {/* Logo & Description */}
            <div className="md:col-span-1">
              <div className="mb-6">
                <div className="text-3xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'serif' }}>
                  Fund My Science
                </div>
                <div className="space-y-2 text-gray-600 text-sm">
                  <p>123 Creative Avenue, Suite 456, Samarlinda,</p>
                  <p>Indonesia</p>
                  <p className="mt-4">hello@innovartestudio.com</p>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-6">Quick Links</h3>
              <ul className="space-y-3 text-gray-600">
                <li><Link href="/" className="hover:text-gray-900 transition-colors">Our Craft</Link></li>
                <li><Link href="/" className="hover:text-gray-900 transition-colors">Showcase</Link></li>
                <li><Link href="/" className="hover:text-gray-900 transition-colors">Team</Link></li>
                <li><Link href="/" className="hover:text-gray-900 transition-colors">Insight</Link></li>
                <li><Link href="/" className="hover:text-gray-900 transition-colors">Contact</Link></li>
              </ul>
            </div>

            {/* Follow Us */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-6">Follow Us</h3>
              <ul className="space-y-3 text-gray-600">
                <li><Link href="/" className="hover:text-gray-900 transition-colors">Linkedin</Link></li>
                <li><Link href="/" className="hover:text-gray-900 transition-colors">Instagram</Link></li>
                <li><Link href="/" className="hover:text-gray-900 transition-colors">X (Twitter)</Link></li>
                <li><Link href="/" className="hover:text-gray-900 transition-colors">Facebook</Link></li>
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Stay <em className="italic" style={{ fontFamily: 'serif' }}>Updated</em></h3>
              <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                Subscribe to our newsletter for the latest updates, tips,
                and trends in the world of digital creativity
              </p>

              <div className="flex">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-l-lg focus:ring-0 focus:border-gray-900 text-sm transition-colors outline-none"
                />
                <button className="bg-black hover:bg-gray-800 text-white px-4 py-3 rounded-r-lg transition-colors flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-600 text-sm">
              © 2024 Fund My Science Studio. All rights reserved.
            </p>
            <div className="flex space-x-8 mt-4 md:mt-0">
              <Link href="/" className="text-gray-600 hover:text-gray-900 text-sm transition-colors">Privacy Policy</Link>
              <Link href="/" className="text-gray-600 hover:text-gray-900 text-sm transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
