//import Link from 'next/link';
import styles from './SocialLinks.module.css';
import { FaFacebook, FaInstagram, FaTheaterMasks } from 'react-icons/fa';
import { SiKofi } from 'react-icons/si';

// An array to hold all the social link data
const socialLinks = [
  {
    label: 'Facebook',
    href: 'https://www.facebook.com/profile.php?id=61578837130254',
    icon: <FaFacebook className={styles.socialIcon} />,
  },
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/montgomerieplaywright/',
    icon: <FaInstagram className={styles.socialIcon} />,
  },
  {
    label: 'Ko-fi',
    href: 'https://www.ko-fi.com/williamlwalkermontgomerie',
    icon: <SiKofi className={styles.socialIcon} />,
  },
  {
    label: 'New Play Exchange',
    href: 'https://newplayexchange.org/users/96446/william-l-walker-montgomerie',
    icon: <FaTheaterMasks className={styles.socialIcon} />,
  },
];

export default function SocialLinks() {
  return (
    <ul className={styles.socialsList}>
      {socialLinks.map((link) => (
        <li key={link.label}>
          <a
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.socialLink}
            aria-label={link.label}
          >
            {link.icon}
          </a>
        </li>
      ))}
    </ul>
  );
}
