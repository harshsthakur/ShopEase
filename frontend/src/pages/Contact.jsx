import React, { useState } from 'react';
import { Mail, Phone, Clock, MapPin, Send, HelpCircle } from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Thank you for your message, ${formData.name}! Our food quality & support team will contact you shortly.`);
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const faqs = [
    {
      q: "How are Modaks packaged to remain fresh?",
      a: "Our steamed Ukadiche Modaks are packed in insulated food-grade containers with ice pads and shipped via express priority post. We recommend consuming them within 48 hours or storing them in the refrigerator immediately."
    },
    {
      q: "Are the Alphonso Mangoes naturally ripened?",
      a: "Yes. All our Devgad Alphonso mangoes are ripened naturally in hay boxes. We never use calcium carbide or chemical ripening agents, ensuring the highest flavor quality and food safety."
    },
    {
      q: "Do you offer bulk ordering for festivals and corporate events?",
      a: "Absolutely! We cater to corporate functions, weddings, and festivals (like Ganesh Chaturthi). Please use the contact form or email bulk@shopease.com to receive special pricing and delivery slots."
    }
  ];

  return (
    <div className="space-y-16 pb-16 animate-fade-in max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
      
      {/* Page Title Header */}
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <span className="inline-flex items-center space-x-1 bg-brand-50 text-brand-700 text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full">
          <span>Customer Support & Inquiries</span>
        </span>
        <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">Get in Touch</h1>
        <p className="text-sm text-slate-500">
          Have questions about our organic sourcing, order shipping, or bulk corporate discounts? Send us a message and our team will respond within 24 hours.
        </p>
      </div>

      {/* Main Grid: Form + Details */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Contact Form */}
        <div className="lg:col-span-2 bg-white border border-slate-100 p-8 rounded-2xl shadow-sm space-y-6">
          <h2 className="text-xl font-bold text-slate-800 border-b border-slate-50 pb-3">Send a Message</h2>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Full Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="input-field"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  className="input-field"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Subject</label>
              <input
                type="text"
                name="subject"
                required
                value={formData.subject}
                onChange={handleChange}
                placeholder="Product Inquiry / Bulk Order / Shipping Status"
                className="input-field"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Message</label>
              <textarea
                name="message"
                required
                rows="5"
                value={formData.message}
                onChange={handleChange}
                placeholder="Write your details or questions here..."
                className="input-field resize-none"
              />
            </div>

            <button
              type="submit"
              className="btn-primary w-full sm:w-fit flex items-center justify-center space-x-2"
            >
              <span>Send Message</span>
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>

        {/* Contact Info Sidebar */}
        <div className="space-y-6">
          <div className="bg-slate-900 text-white p-8 rounded-2xl shadow-lg relative overflow-hidden space-y-6">
            {/* Ambient background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/10 rounded-full blur-2xl" />
            
            <h2 className="text-xl font-bold border-b border-slate-800 pb-3">Contact Information</h2>
            
            <div className="space-y-5">
              <div className="flex items-start space-x-4">
                <div className="p-2.5 bg-slate-800 text-brand-400 rounded-xl mt-0.5">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email Us</h4>
                  <p className="text-sm font-medium text-slate-200 mt-0.5">support@shopease.com</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="p-2.5 bg-slate-800 text-brand-400 rounded-xl mt-0.5">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Call Support</h4>
                  <p className="text-sm font-medium text-slate-200 mt-0.5">+1 (800) 555-3663</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="p-2.5 bg-slate-800 text-brand-400 rounded-xl mt-0.5">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Support Hours</h4>
                  <p className="text-sm font-medium text-slate-200 mt-0.5">Mon - Sat: 8:00 AM - 7:00 PM</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="p-2.5 bg-slate-800 text-brand-400 rounded-xl mt-0.5">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Orchard Warehouse</h4>
                  <p className="text-sm font-medium text-slate-200 mt-0.5 leading-relaxed">
                    ShopEase Foods Ltd.<br />
                    102 Devgad Orchard Road,<br />
                    Maharashtra, India
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* FAQ block */}
      <section className="bg-white border border-slate-100 p-8 sm:p-10 rounded-2xl shadow-sm space-y-6">
        <h2 className="text-2xl font-bold text-slate-800 text-center tracking-tight">Frequently Asked Questions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          {faqs.map((faq, index) => (
            <div key={index} className="space-y-2 border-t border-slate-50 pt-4 md:border-t-0 md:pt-0 md:px-4 first:pl-0 last:pr-0">
              <div className="flex items-center space-x-2 text-brand-600">
                <HelpCircle className="h-5 w-5 flex-shrink-0" />
                <h4 className="font-bold text-slate-800 text-sm">{faq.q}</h4>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed pl-7">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};

export default Contact;
