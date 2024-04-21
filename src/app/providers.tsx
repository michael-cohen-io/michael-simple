"use client";

import { ThemeProvider } from "next-themes";
import { usePathname } from "next/navigation";
import React from "react";

// import ThemeButton from "@/components/button/theme-button";
// import {
//   MobileMenu,
//   MobileMenuProvider,
//   useMobileMenuContext,
// } from "@/components/nav/mobile-nav";
// import NavItems from "@/components/nav/nav-items";
// import Heading from "@/components/typography/heading";
// import { HamburgerMenuIcon } from "@radix-ui/react-icons";
// import { Button, Flex, IconButton, Link } from "@radix-ui/themes";

// function NavLink({ href, title }: { href: string; title: string }) {
//   const pathname = usePathname();
//   const isActive = pathname === href;
//   return (
//     <Flex asChild display="flex" align="center" width="100%">
//       <Button asChild variant={isActive ? "soft" : "ghost"} radius="full">
//         <Link
//           href={href}
//           className={`rounded-6 link ${isActive ? "active" : ""}`}
//         >
//           <Heading
//             size="3"
//             align="center"
//             color={isActive ? "pink" : "gray"}
//             weight="medium"
//           >
//             {title}
//           </Heading>
//         </Link>
//       </Button>
//     </Flex>
//   );
// }

// function MobileMenuContent() {
//   const mobileMenu = useMobileMenuContext();
//   return (
//     <Flex direction="column">
//       <Flex
//         width="100%"
//         display={{ initial: "flex", md: "none" }}
//         px="4"
//         py="4"
//         justify="between"
//         align="center"
//       >
//         <Link href="/" className="flex items-center text-3xl select-none">
//           <Heading color="pink" size="7" weight="regular">
//             {"<MC>"}
//           </Heading>
//         </Link>
//         <Flex display={{ md: "none" }} align="center" gap="4" pr="4">
//           <ThemeButton />
//           <IconButton
//             size="3"
//             variant="ghost"
//             radius="large"
//             data-state={mobileMenu.open ? "open" : "closed"}
//             onClick={() => mobileMenu.setOpen((open) => !open)}
//           >
//             <HamburgerMenuIcon width="24" height="24" />
//           </IconButton>
//         </Flex>
//       </Flex>
//       <Flex
//         align="start"
//         direction="column"
//         justify="between"
//         gap="4"
//         height="100%"
//         width="100%"
//         px="4"
//       >
//         <NavItems NavLinkComponent={NavLink} />
//       </Flex>
//     </Flex>
//   );
// }

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system">
      {/* <MobileMenuProvider>
        <MobileMenu>
          <MobileMenuContent />
        </MobileMenu> */}
      {children}
      {/* </MobileMenuProvider> */}
    </ThemeProvider>
  );
}
