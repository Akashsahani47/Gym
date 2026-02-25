// components/Footer.jsx
'use client';

import Link from 'next/link';
import { Shield, Building, Users, User, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, Github } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: 'Home', href: '/' },
    { name: 'Features', href: '/features' },
    { name: 'Dashboards', href: '/dashboards' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'About', href: '/about' },
  ];

  const roleLinks = [
    { name: 'Super Admin', href: '/dashboard/super-admin', icon: Shield, color: 'text-[#DAFF00]' },
    { name: 'Gym Owners', href: '/dashboard/gymOwner', icon: Building, color: 'text-purple-400' },
    { name: 'Trainers', href: '/dashboard/trainer', icon: Users, color: 'text-blue-400' },
    { name: 'Members', href: '/dashboard/member', icon: User, color: 'text-emerald-400' },
  ];

  const legalLinks = [
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Cookie Policy', href: '/cookies' },
    { name: 'GDPR Compliance', href: '/gdpr' },
  ];

  const socialLinks = [
    { name: 'Facebook', href: '#', icon: Facebook, color: 'hover:text-blue-500' },
    { name: 'Twitter', href: '#', icon: Twitter, color: 'hover:text-sky-400' },
    { name: 'Instagram', href: '#', icon: Instagram, color: 'hover:text-pink-500' },
    { name: 'LinkedIn', href: '#', icon: Linkedin, color: 'hover:text-blue-600' },
    { name: 'GitHub', href: '#', icon: Github, color: 'hover:text-gray-300' },
  ];

  return (
    <footer className="bg-black border-t border-gray-800">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 lg:gap-12">
          
          {/* Logo & Description - full width on mobile */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4 sm:mb-6">
              <Shield className="w-8 h-8 sm:w-10 sm:h-10 text-[#DAFF00] shrink-0" />
              <span className="text-2xl sm:text-3xl font-bold">
                <span className="text-white">Zel</span>
                <span className="text-[#DAFF00]">voo</span>
              </span>
            </div>
            
            <p className="text-gray-400 mb-4 sm:mb-6 text-xs sm:text-sm leading-relaxed max-w-md">
              Complete gym management ecosystem for Super Admins, Gym Owners, Trainers, and Members. 
              One platform, every role, seamless integration.
            </p>
            
            <div className="flex items-center gap-3 sm:gap-4 mb-6">
              {socialLinks.map((social, index) => (
                <Link
                  key={index}
                  href={social.href}
                  className={`min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-400 hover:text-white transition-colors rounded-lg active:bg-white/5 ${social.color}`}
                  aria-label={social.name}
                >
                  <social.icon className="w-5 h-5" />
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold text-base sm:text-lg mb-4 sm:mb-6 flex items-center gap-2">
              <div className="w-1 h-5 sm:h-6 bg-[#DAFF00] rounded-full shrink-0"></div>
              Quick Links
            </h3>
            <ul className="space-y-2 sm:space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-[#DAFF00] transition-colors flex items-center gap-2 group py-1.5 min-h-[44px] items-center"
                  >
                    <div className="w-1.5 h-1.5 bg-gray-700 rounded-full group-hover:bg-[#DAFF00] transition-colors shrink-0"></div>
                    <span className="text-sm sm:text-base">{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Dashboards */}
          <div>
            <h3 className="text-white font-bold text-base sm:text-lg mb-4 sm:mb-6 flex items-center gap-2">
              <div className="w-1 h-5 sm:h-6 bg-purple-500 rounded-full shrink-0"></div>
              Dashboard Roles
            </h3>
            <ul className="space-y-2 sm:space-y-3">
              {roleLinks.map((role, index) => (
                <li key={index}>
                  <Link
                    href={role.href}
                    className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 group py-1.5 min-h-[44px] items-center"
                  >
                    <div className={`${role.color} opacity-80 shrink-0`}>
                      <role.icon className="w-4 h-4" />
                    </div>
                    <span className={`text-sm sm:text-base group-hover:${role.color} transition-colors`}>
                      {role.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-bold text-base sm:text-lg mb-4 sm:mb-6 flex items-center gap-2">
              <div className="w-1 h-5 sm:h-6 bg-blue-500 rounded-full shrink-0"></div>
              Contact Us
            </h3>
            <ul className="space-y-3 sm:space-y-4">
              <li className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-[#DAFF00] mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-white text-xs sm:text-sm font-medium">Email</p>
                  <a href="mailto:ak676964@gmail.com" className="text-gray-400 hover:text-[#DAFF00] text-xs sm:text-sm transition-colors break-all">
                    ak676964@gmail.com
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-[#DAFF00] mt-0.5 shrink-0" />
                <div>
                  <p className="text-white text-xs sm:text-sm font-medium">Phone</p>
                  <a href="tel:+917903983741" className="text-gray-400 hover:text-[#DAFF00] text-xs sm:text-sm transition-colors">
                    +91 7903983741
                  </a>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Features Highlight - 1 col mobile */}
        <div className="mt-10 sm:mt-12 pt-6 sm:pt-8 border-t border-gray-800">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 text-center">
              <div className="w-10 h-10 rounded-full bg-[#DAFF00]/10 border border-[#DAFF00]/30 flex items-center justify-center mx-auto mb-3">
                <Shield className="w-5 h-5 text-[#DAFF00]" />
              </div>
              <h4 className="text-white font-semibold mb-1 text-sm sm:text-base">Enterprise Security</h4>
              <p className="text-gray-400 text-xs sm:text-sm">Bank-level encryption & compliance</p>
            </div>
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 text-center">
              <div className="w-10 h-10 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center mx-auto mb-3">
                <Building className="w-5 h-5 text-purple-400" />
              </div>
              <h4 className="text-white font-semibold mb-1 text-sm sm:text-base">Multi-Gym Support</h4>
              <p className="text-gray-400 text-xs sm:text-sm">Manage unlimited gym locations</p>
            </div>
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 text-center">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mx-auto mb-3">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
              <h4 className="text-white font-semibold mb-1 text-sm sm:text-base">Real-time Sync</h4>
              <p className="text-gray-400 text-xs sm:text-sm">Instant updates across all roles</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-800 bg-gray-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 sm:py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            {/* Copyright */}
            <div className="text-gray-400 text-xs sm:text-sm order-2 sm:order-1">
              © {currentYear} Zelvoo. All rights reserved.
            </div>

            {/* Legal Links - wrap on mobile */}
            <div className="flex flex-wrap items-center justify-center sm:justify-end gap-3 sm:gap-4 md:gap-6 text-xs sm:text-sm order-1 sm:order-2">
              {legalLinks.map((link, index) => (
                <Link
                  key={index}
                  href={link.href}
                  className="text-gray-400 hover:text-[#DAFF00] transition-colors min-h-[44px] flex items-center justify-center"
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Built With Pride */}
            <div className="flex items-center justify-center gap-2 text-gray-400 text-xs sm:text-sm order-3">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-[#DAFF00] animate-pulse"></div>
                <span>Built for India</span>
              </div>
              <span className="mx-2">•</span>
              <span>Ready for the world</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}