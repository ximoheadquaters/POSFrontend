export const mockServices = [
  {
    id: 1,
    title: 'POS System',
    slug: 'pos-system',
    tagline: 'Enterprise-Grade Point of Sale',
    description: 'A modern, cloud-based point of sale system designed for businesses of all sizes. Manage inventory, process payments, track sales, and gain real-time insights into your operations.',
    features: [
      {
        title: 'Inventory Management',
        description: 'Real-time inventory tracking with automated stock alerts and purchase order management.',
        icon: 'package',
      },
      {
        title: 'Sales Analytics',
        description: 'Comprehensive dashboards and reports to understand your sales patterns and business performance.',
        icon: 'chart',
      },
      {
        title: 'Payment Processing',
        description: 'Accept all major payment methods including credit cards, mobile payments, and contactless.',
        icon: 'credit-card',
      },
      {
        title: 'Multi-Store & Stock Transfers',
        description: 'Manage multiple store locations and dispatch/receive inventory transfers between branches with real-time tracking.',
        icon: 'truck',
      },
      {
        title: 'Employee Management',
        description: 'Track employee performance, manage schedules, and control permissions.',
        icon: 'users',
      },
      {
        title: 'Customer Relations',
        description: 'Built-in CRM tools to manage customer data, loyalty programs, and marketing.',
        icon: 'heart',
      },
    ],
    pricing: [
      {
        name: 'Starter',
        price: 29,
        period: 'month',
        description: 'Perfect for small businesses getting started.',
        features: [
          'Up to 500 transactions/month',
          'Basic inventory management',
          'Single store location',
          'Email support',
          'Basic reporting',
        ],
        popular: false,
        cta: 'Get Started',
      },
      {
        name: 'Professional',
        price: 79,
        period: 'month',
        description: 'For growing businesses that need more power.',
        features: [
          'Unlimited transactions',
          'Advanced inventory management',
          'Up to 3 store locations',
          'Multi-branch stock transfers',
          'Priority support',
          'Advanced analytics & reports',
          'Employee management',
          'CRM integration',
        ],
        popular: true,
        cta: 'Start Free Trial',
      },
      {
        name: 'Enterprise',
        price: 199,
        period: 'month',
        description: 'For large organizations with complex needs.',
        features: [
          'Unlimited transactions',
          'Enterprise inventory management',
          'Unlimited store locations',
          'Multi-branch stock transfers',
          'Dedicated support team',
          'Custom reporting',
          'API access',
          'Custom integrations',
          'SLA guarantee',
        ],
        popular: false,
        cta: 'Contact Sales',
      },
    ],
  },
];

export const getServiceBySlug = (slug) => {
  return mockServices.find((s) => s.slug === slug) || null;
};