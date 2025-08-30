import Navigation from '@/components/Navigation'
import Link from 'next/link'

export default function Home() {
    return (
        <div className="min-h-screen">
            <Navigation />

            {/* Hero Section with Background Image */}
            <section className="relative h-screen bg-gray-900">
                {/* Background Image */}
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{
                        backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('data:image/svg+xml,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 1200 800\"%3E%3Cdefs%3E%3ClinearGradient id=\"grad\" x1=\"0%25\" y1=\"0%25\" x2=\"100%25\" y2=\"100%25\"%3E%3Cstop offset=\"0%25\" style=\"stop-color:%23059669;stop-opacity:1\" /%3E%3Cstop offset=\"100%25\" style=\"stop-color:%23065f46;stop-opacity:1\" /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width=\"1200\" height=\"800\" fill=\"url(%23grad)\"/%3E%3Cg fill=\"white\" opacity=\"0.1\"%3E%3Ccircle cx=\"600\" cy=\"300\" r=\"2\"%3E%3Canimate attributeName=\"opacity\" values=\"0.1;0.3;0.1\" dur=\"3s\" repeatCount=\"indefinite\"/%3E%3C/circle%3E%3Ccircle cx=\"300\" cy=\"500\" r=\"1.5\"%3E%3Canimate attributeName=\"opacity\" values=\"0.1;0.4;0.1\" dur=\"4s\" repeatCount=\"indefinite\"/%3E%3C/circle%3E%3Ccircle cx=\"900\" cy=\"200\" r=\"1\"%3E%3Canimate attributeName=\"opacity\" values=\"0.1;0.2;0.1\" dur=\"5s\" repeatCount=\"indefinite\"/%3E%3C/circle%3E%3C/g%3E%3C/svg%3E')"
                    }}
                />

                {/* Hero Content */}
                <div className="relative z-10 flex items-center justify-center h-full">
                    <div className="text-center text-white max-w-4xl mx-auto px-4">
                        <h1 className="text-5xl md:text-7xl font-bold mb-6">
                            Featured <em className="italic">Projects</em>
                        </h1>
                        <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed">
                            Explore new and upcoming featured projects, where we highlight our most notable
                            work. Every project is a testament to our commitment to excellence, innovation, and
                            purpose.
                        </p>
                    </div>
                </div>
            </section>

            {/* Our Projects Section */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        Our <em className="italic">Projects</em>
                    </h2>
                    <p className="text-gray-600 mb-12 max-w-2xl">
                        Discover groundbreaking research opportunities and invest in the future of
                        science.
                    </p>

                    {/* Filter Buttons */}
                    <div className="flex flex-wrap gap-4 mb-12">
                        <button className="bg-green-600 text-white px-6 py-2 rounded-full font-medium">
                            All
                        </button>
                        <button className="text-gray-600 hover:text-green-600 px-6 py-2 rounded-full font-medium border border-gray-300 hover:border-green-600">
                            Renewable
                        </button>
                        <button className="text-gray-600 hover:text-green-600 px-6 py-2 rounded-full font-medium border border-gray-300 hover:border-green-600">
                            Cancer
                        </button>
                        <button className="text-gray-600 hover:text-green-600 px-6 py-2 rounded-full font-medium border border-gray-300 hover:border-green-600">
                            Water
                        </button>
                    </div>

                    {/* Project Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Project Card 1 */}
                        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white relative overflow-hidden">
                            <div className="absolute top-4 right-4">
                                <span className="bg-white/20 text-white text-xs px-2 py-1 rounded-full">Active Funding</span>
                            </div>
                            <div className="absolute top-4 right-20">
                                <span className="bg-green-700 text-white text-xs px-2 py-1 rounded-full">In Progress</span>
                            </div>

                            <div className="mb-6">
                                <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2L2 7v10c0 5.55 3.84 9.739 9 11 5.16-1.261 9-5.45 9-11V7l-10-5z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold mb-2">Advancing Cancer Immunotherapy</h3>
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-8 h-8 bg-white/20 rounded-full"></div>
                                    <span className="text-sm">Research team</span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <p className="text-sm opacity-90">
                                    Developing a novel immunotherapy approach targeting
                                    multiple cancer pathways, with breakthrough potential for
                                    several cancer types.
                                </p>

                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">Funding Progress</span>
                                    <span className="text-sm font-bold">75%</span>
                                </div>
                                <div className="w-full bg-white/20 rounded-full h-2">
                                    <div className="bg-white h-2 rounded-full" style={{ width: '75%' }}></div>
                                </div>

                                <div className="flex justify-between items-center pt-2">
                                    <div>
                                        <div className="text-xs opacity-75">260 Backers</div>
                                        <div className="text-xs opacity-75">Goal: $15k</div>
                                    </div>
                                    <Link
                                        href="/projects"
                                        className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium"
                                    >
                                        View Project
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Project Card 2 */}
                        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white relative overflow-hidden">
                            <div className="absolute top-4 right-4">
                                <span className="bg-white/20 text-white text-xs px-2 py-1 rounded-full">Active Funding</span>
                            </div>
                            <div className="absolute top-4 right-20">
                                <span className="bg-green-700 text-white text-xs px-2 py-1 rounded-full">In Progress</span>
                            </div>

                            <div className="mb-6">
                                <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2L2 7v10c0 5.55 3.84 9.739 9 11 5.16-1.261 9-5.45 9-11V7l-10-5z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold mb-2">Renewable Energy Storage</h3>
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-8 h-8 bg-white/20 rounded-full"></div>
                                    <span className="text-sm">Research team</span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <p className="text-sm opacity-90">
                                    Revolutionary battery technology for efficient renewable energy
                                    storage with 10x capacity improvement over current solutions.
                                </p>

                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">Funding Progress</span>
                                    <span className="text-sm font-bold">62%</span>
                                </div>
                                <div className="w-full bg-white/20 rounded-full h-2">
                                    <div className="bg-white h-2 rounded-full" style={{ width: '62%' }}></div>
                                </div>

                                <div className="flex justify-between items-center pt-2">
                                    <div>
                                        <div className="text-xs opacity-75">190 Backers</div>
                                        <div className="text-xs opacity-75">Goal: $12k</div>
                                    </div>
                                    <Link
                                        href="/projects"
                                        className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium"
                                    >
                                        View Project
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Project Card 3 */}
                        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white relative overflow-hidden">
                            <div className="absolute top-4 right-4">
                                <span className="bg-white/20 text-white text-xs px-2 py-1 rounded-full">Active Funding</span>
                            </div>
                            <div className="absolute top-4 right-20">
                                <span className="bg-green-700 text-white text-xs px-2 py-1 rounded-full">In Progress</span>
                            </div>

                            <div className="mb-6">
                                <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2L2 7v10c0 5.55 3.84 9.739 9 11 5.16-1.261 9-5.45 9-11V7l-10-5z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold mb-2">Clean Water Technology</h3>
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-8 h-8 bg-white/20 rounded-full"></div>
                                    <span className="text-sm">Research team</span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <p className="text-sm opacity-90">
                                    Advanced filtration system providing clean drinking water
                                    for remote communities using solar-powered purification.
                                </p>

                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">Funding Progress</span>
                                    <span className="text-sm font-bold">88%</span>
                                </div>
                                <div className="w-full bg-white/20 rounded-full h-2">
                                    <div className="bg-white h-2 rounded-full" style={{ width: '88%' }}></div>
                                </div>

                                <div className="flex justify-between items-center pt-2">
                                    <div>
                                        <div className="text-xs opacity-75">310 Backers</div>
                                        <div className="text-xs opacity-75">Goal: $18k</div>
                                    </div>
                                    <Link
                                        href="/projects"
                                        className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium"
                                    >
                                        View Project
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Load More */}
                    <div className="text-center mt-12">
                        <Link
                            href="/projects"
                            className="inline-block bg-gray-100 hover:bg-gray-200 text-gray-800 px-8 py-3 rounded-lg font-medium"
                        >
                            Load More
                        </Link>
                    </div>
                </div>
            </section>

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
                                    &ldquo;FundMyScience transformed our research funding approach from the ground up. Their deep understanding of our vision
                                    and their innovative platform design were simply unmatched. The new funding model and support system
                                    have not only resonated with our research community but have also driven measurable results. We
                                    couldn&rsquo;t be happier with the outcomes.&rdquo;
                                </p>
                                <div className="flex items-center">
                                    <div className="w-12 h-12 bg-gray-200 rounded-full mr-4"></div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900">Dr. Sarah Chen</h4>
                                        <p className="text-gray-600 text-sm">Research Director at BioInnovate</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Image placeholder */}
                        <div className="relative">
                            <div className="w-full h-96 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center">
                                <svg className="w-24 h-24 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
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
                            <div key={i} className="w-16 h-16 bg-gray-300 rounded-full mx-auto flex items-center justify-center">
                                <span className="text-gray-600 text-sm">Logo</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section className="py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        {/* Contact Image */}
                        <div className="relative">
                            <div className="w-full h-96 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center">
                                <svg className="w-24 h-24 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
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
                                    <p className="text-gray-600">hi@fundmyscience.com</p>
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
                        Let&rsquo;s <em className="italic">Collaborate!</em>
                    </h2>
                    <p className="text-xl text-gray-300 mb-8">
                        Ready to fund groundbreaking research? We&rsquo;re excited to hear from you! Drop
                        us a line and let&rsquo;s discuss how we can turn your ideas into the future of science.
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
