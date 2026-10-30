"use client";

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { toggleLoginDialog } from '@/store/slice/userSlice';
import { RootState } from '@/store/store';
import { BookLock, ChevronRight, FileTerminal, Heart, HelpCircle, Lock, LogOut, Menu, Package, PiggyBank, Search, ShoppingCart, User, User2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

const Header = () => {

  const [isDropDownOpen, setIsDropDownOpen] = useState(false)

  const router = useRouter()
  const dispatch = useDispatch()
  const isLoginOpen = useSelector((state: RootState) => state.user.isLoggedIn)

  const user = {
    profilePicture: "",
    name: "",
    email: "",
  }

  const userPlacholder = "";

  const handleLoginCLick = () => {
    dispatch(toggleLoginDialog())
    setIsDropDownOpen(false)
  }

  const handleProtectionNavigation = (href: string) => {

    if (user) {
      router.push(href)
      setIsDropDownOpen(false)

    } else {
      dispatch(toggleLoginDialog())
      setIsDropDownOpen(false)


    }

  }

  const handleLogout = () => {

  }

  const menuItems = [
    ...(user && user ? [
      {
        href: 'account/profile',
        content: (
          <div className='flex space-x-4 items-center p-2 border-b' >
            <Avatar className='w-12 h-12 -ml-2 rounded-full' >
              {user?.profilePicture ? (
                <AvatarImage alt='user_image'></AvatarImage>
              ) : (
                <AvatarFallback>{userPlacholder}</AvatarFallback>
              )}
            </Avatar>
            <div className='flex flex-col' >
              <span className='font-semibold text-md'>
                {user.name}
              </span>
              <span className='text-xs text-gray-500'>
                {user.email}
              </span>
            </div>
          </div>
        )
      }
    ] : [
      {
        icon: <Lock className='h-5 w-5 ' />,
        label: "Login / Sign Up",
        onclick: handleLoginCLick,
      }
    ]
    ),
    {
      icon: <User className='h-5 w-5 ' />,
      label: "My Profile",
      onclick: () => handleProtectionNavigation('/account/profile'),
    },
    {
      icon: <Package className='h-5 w-5 ' />,
      label: "My Orders",
      onclick: () => handleProtectionNavigation('/account/orders'),
    },
    {
      icon: <PiggyBank className='h-5 w-5 ' />,
      label: "My Selling Orders",
      onclick: () => handleProtectionNavigation('/account/selling-products'),
    },
    {
      icon: <ShoppingCart className='h-5 w-5 ' />,
      label: "Cart",
      onclick: () => handleProtectionNavigation('/checkout/cart'),
    },
    {
      icon: <Heart className='h-5 w-5 ' />,
      label: "My Wishlist",
      onclick: () => handleProtectionNavigation('/account/wishlist'),
    },
    {
      icon: <User2 className='h-5 w-5 ' />,
      label: "About Us",
      href: '/about-us',
    },
    {
      icon: <FileTerminal className='h-5 w-5 ' />,
      label: "Terms of Use",
      href: '/terms-of-use',
    },
    {
      icon: <BookLock className='h-5 w-5 ' />,
      label: "Privacy Policy",
      href: '/privacy-policy',
    },
    {
      icon: <HelpCircle className='h-5 w-5 ' />,
      label: "Help",
      href: '/how-it-works',
    },

    ...(user && [
      {
        icon: <LogOut className='h-5 w-5 ' />,
        label: "Logout",
        onclick: handleLogout,
      },
    ])

  ]

  const MenuItems = ({ className = "" }: { className?: string }) => (
    <div className={className} >
      {menuItems?.map((item, index) =>
        item?.href ? (
          <Link
            key={index}
            href={item.href}
            className='flex items-center gap-3 px-4 py-3 text-sm rounded-lg hover:bg-gray-200'
            onClick={() => setIsDropDownOpen(false)}
          >
            {item.icon}
            <span>
              {item?.label}
            </span>
            {item?.content && <div className='mt-1' >{item?.content}</div>}
            <ChevronRight className='w-4 h-4 ml-auto' />
          </Link>
        ) : (
          <button
            key={index}
            className='flex w-full items-center gap-3 px-4 py-3 text-sm rounded-lg hover:bg-gray-200'
            onClick={() => setIsDropDownOpen(false)}
          >
            {item.icon}
            <span>
              {item?.label}
            </span>
            <ChevronRight className='w-4 h-4 ml-auto' />
          </button>
        )


      )

      }
    </div>
  )


  return (
    <header className='border-b bg-white sticky top-0 z-50' >
      {/*Desktop header*/}
      <div className='container w-[80%] mx-auto hidden lg:flex items-center
       justify-between p-4'>

        <Link href='/' className='flex items-center' >
          <Image
            src='/images/web-logo.svg'
            alt='desktop_logo'
            width={450}
            height={100}
            className='h-15 w-auto'
          />
        </Link>


        <div className='flex flex-1 items-center justify-center max-w-xl px-4'>

          <div className='relative w-full' >
            <Input
              type='text'
              placeholder='Book Name / Author / Subject / Publisher'
              className='w-full pr-10'
              value=''
              onChange={() => { }}

            />
            <Button
              size='icon'
              variant='ghost'
              className='absolute right-0 top-1/2 -translate-y-1/2'
            >
              <Search className='h-5 w-5' />
            </Button>

          </div>

        </div>

        <div className='flex items-center gap-4'>
          <Link href='/book-sell' >
            <Button variant='secondary' className='normal-case tracking-normal bg-red-400 text-white hover:bg-red-500 rounded' >
              Sell Books
            </Button>
          </Link>

          <DropdownMenu open={isDropDownOpen} onOpenChange={setIsDropDownOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' className='normal-case tracking-normal' >
                <Avatar className='w-8 h-8 rounded-full' >
                  {user?.profilePicture ? (
                    <AvatarImage alt='user_image'></AvatarImage>
                  ) : userPlacholder ? (
                    <AvatarFallback>{userPlacholder}</AvatarFallback>
                  ) : (
                    <User className='ml-2 mt-2' />
                  )}


                </Avatar>
                My Account
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className='w-80 p-2' >
              <MenuItems />
            </DropdownMenuContent>
          </DropdownMenu>

          <Link href='/checkout/cart' >
            <div className='relative' >
              <Button variant='ghost' className='relative normal-case tracking-normal'>
                <ShoppingCart className='h-5 w-5 mr-2' />
                Cart
              </Button>
              {user && (
                <span className='absolute top-2 left-7 transform translate-x-1/2 -translate-y-1/2 bg-red-500 text-white rounded-full px-1 text-xs' >3</span>
              )}
            </div>
          </Link>





        </div>





      </div>



      {/*     Mobhle Header */}

      <div className='container mx-auto flex lg:hidden items-center justify-between p-4 ' >

        <Sheet>
          <SheetTrigger asChild >
            <Button variant='ghost' size='icon'>
              <Menu className='h-6 w-6' />
            </Button>
          </SheetTrigger>
          <SheetContent side='left' className='w-80 p-0' >
            <SheetHeader>
              <SheetTitle className='sr-only'></SheetTitle>
            </SheetHeader>
            <div className='border-b p-4' >
              <Link href="/">
                <Image
                  src='/images/web-logo.svg'
                  alt='mobile_logo'
                  width={150}
                  height={40}
                  className='h-10 w-auto'
                />
              </Link>

            </div>
            <MenuItems className="py-2" />
          </SheetContent>
        </Sheet>


        <Link href='/' className='flex items-center' >
          <Image
            src='/images/web-logo.svg'
            alt='mobile_logo'
            width={450}
            height={100}
            className='h-6 md:h-10   w-20  md:w-auto'
          />
        </Link>


        <div className='flex flex-1 items-center justify-center max-w-xl px-4'>

          <div className='relative w-full' >
            <Input
              type='text'
              placeholder='Search Books...'
              className='w-full pr-10'
              value=''
              onChange={() => { }}

            />
            <Button
              size='icon'
              variant='ghost'
              className='absolute right-0 top-1/2 -translate-y-1/2'
            >
              <Search className='h-5 w-5' />
            </Button>

          </div>

        </div>


        <Link href='/checkout/cart' >
          <div className='relative' >
            <Button variant='ghost' className='relative normal-case tracking-normal'>
              <ShoppingCart className='h-5 w-5 mr-2' />
            </Button>
            {user && (
              <span className='absolute top-2 left-7 transform translate-x-1/2 -translate-y-1/2 bg-red-500 text-white rounded-full px-1 text-xs' >3</span>
            )}
          </div>
        </Link>

      </div>



    </header>

  );

}

export default Header;