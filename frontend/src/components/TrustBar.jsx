import { motion } from 'framer-motion';
import { ShieldCheck, Truck, Package, Headphones } from 'lucide-react';
import './TrustBar.css';

const features = [
  {
    icon: <ShieldCheck size={24} strokeWidth={2} />,
    title: 'Temple-Grade Quality',
    desc: 'Sanctified handcrafted art',
  },
  {
    icon: <Truck size={24} strokeWidth={2} />,
    title: 'Free Express Shipping',
    desc: 'On all orders above ₹500',
  },
  {
    icon: <Package size={24} strokeWidth={2} />,
    title: 'Transit-Safe Packaging',
    desc: 'Wooden protective shielding',
  },
  {
    icon: <Headphones size={24} strokeWidth={2} />,
    title: 'Devoted Support',
    desc: 'Help via WhatsApp & Call',
  },
];

export default function TrustBar() {
  return (
    <section className="trust-bar" aria-label="Store guarantees and privileges">
      <div className="section-wrap">
        <div className="trust-bar-inner">
          {features.map((f, idx) => (
            <motion.div
              key={f.title}
              className="trust-item"
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.25, delay: idx * 0.05 }}
              whileHover={{ y: -4, scale: 1.02 }}
            >
              <span className="trust-icon" aria-hidden="true">{f.icon}</span>
              <div className="trust-meta">
                <p className="trust-title">{f.title}</p>
                <p className="trust-desc">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
