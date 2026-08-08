/** Shared Unsplash portrait URLs for auth / marketing dummy profiles */
export const AUTH_DEMO_AVATARS = [
  {
    name: "Rahman Ahmed",
    role: "Owner, Dhaka Grocery Mart",
    src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces",
    top: "8%",
    left: "12%",
    delay: 0,
  },
  {
    name: "Fatema Khanam",
    role: "Manager, Style Boutique",
    src: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=faces",
    top: "18%",
    right: "10%",
    delay: 0.4,
  },
  {
    name: "Karim Hossain",
    role: "Director, Karim Wholesale",
    src: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=faces",
    top: "48%",
    left: "6%",
    delay: 0.8,
  },
  {
    name: "Nusrat Sultana",
    role: "Owner, City Pharmacy",
    src: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=faces",
    top: "55%",
    right: "8%",
    delay: 1.2,
  },
  {
    name: "Mahmud Ali",
    role: "Founder, Tech Hub Store",
    src: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=faces",
    bottom: "22%",
    left: "18%",
    delay: 1.6,
  },
] as const;

/** Profile image shown above login / register form */
export const AUTH_FORM_PROFILE_SRC =
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop&crop=faces";

/** Testimonial carousel people (subset with quotes from i18n keys) */
export const AUTH_TESTIMONIAL_PHOTOS = [
  AUTH_DEMO_AVATARS[0].src,
  AUTH_DEMO_AVATARS[1].src,
  AUTH_DEMO_AVATARS[2].src,
] as const;
