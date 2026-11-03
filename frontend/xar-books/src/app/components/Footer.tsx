import Link from 'next/link';
import { FaFacebook, FaInstagram, FaXTwitter, FaYoutube } from 'react-icons/fa6';
import { FaCcAmex, FaCcMastercard, FaCcStripe, FaCcVisa } from 'react-icons/fa';




function Footer() {

  const footerLinks = [
    {
      title: 'About Us',
      links: [
        { label: 'About Xar Books', href: '/about-us' },
        { label: 'Contact Us', href: '/contact-us' },
      ],
    },
    {
      title: 'Useful Links',
      links: [
        { label: 'How it Works', href: '/how-it-works' },
        { label: 'Blogs', href: '/blogs' },
        { label: 'Sell Books', href: '/book-sell' },
      ],
    },
    {
      title: 'Policies',
      links: [
        { label: 'Terms of Use', href: '/terms-of-use' },
        { label: 'Privacy Policy', href: '/privacy-policy' },
      ],
    },
  ];


  const socialLinks = [
    { icon: FaFacebook, href: 'https://facebook.com', label: 'Facebook' },
    { icon: FaInstagram, href: 'https://instagram.com', label: 'Instagram' },
    { icon: FaXTwitter, href: 'https://x.com', label: 'X' },
    { icon: FaYoutube, href: 'https://youtube.com', label: 'YouTube' },
  ];

  const paymentIcons = [FaCcVisa, FaCcMastercard, FaCcAmex, FaCcStripe];



  return (
    <footer className='bg-gray-900 text-gray-300' >
      <div className='container mx-auto px-4 py-12' >
        <div className='grid grid-cols-1 gap-8 md:grid-cols-4' >
          {footerLinks.map((section) => (
            <div key={section.title} >
              <h3 className='mb-4 text-lg font-semibold text-white' >
                {section.title}
              </h3>
              <ul className='space-y-2' >
                {section.links.map((link) => (
                  <li key={link.href} >
                    <Link href={link.href} className='transition-colors hover:text-white' >
                      {link.label}
                    </Link>
                  </li>
                ))

                }
              </ul>
            </div>
          ))}
          <div>
            <h3 className='mb-4 text-lg font-semibold text-white' >
              Stay Connected
            </h3>
            <div className='mb-4 flex gap-4'>
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target='_blank'
                  rel='noopener noreferrer'
                  aria-label={label}
                  className='transition-colors hover:text-white'

                >
                  <Icon className='h-6 w-6' />
                </a>
              ))

              }
            </div>
            <p className='text-sm' >
              Xar Books is a marketplace to buy and sell used books at the best prices.
            </p>
          </div>
        </div>

        <div className='mt-12 flex flex-col items-center justify-between gap-4
        border-t border-gray-700 pt-8 md:flex-row' >

          <p className='text-sm' >
              &copy; {new Date().getFullYear()} Xar Books. All rights reserved.
          </p>
          <div className='flex items-center gap-4' >
            {paymentIcons.map((Icon, index)=>(
              <Icon key={index} className='h-8 w-8 text-gray-400' />
            ))

            }

          </div>

        </div>


      </div>
    </footer>
  )
}

export default Footer;