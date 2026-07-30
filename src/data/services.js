const coreServices = [
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
        title: 'Multi-Store Support',
        description: 'Manage multiple locations from a single dashboard with centralized control.',
        icon: 'building',
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
  {
    id: 2,
    title: 'Business Management',
    slug: 'business-management',
    tagline: 'One clearer view of your daily operation',
    description: 'Bring sales, staff activity, purchasing, and business reporting into one practical workspace. Ximo Business Management helps owners spend less time chasing updates and more time making decisions.',
    features: [
      { title: 'Team Scheduling', description: 'Build schedules, track shifts, and keep everyone aligned across locations.', icon: 'users' },
      { title: 'Purchase Orders', description: 'Create, approve, and track supplier orders from one shared workspace.', icon: 'package' },
      { title: 'Business Reports', description: 'See the numbers that matter with clear daily, weekly, and monthly reporting.', icon: 'chart' },
    ],
    pricing: [
      { name: 'Essentials', price: 39, period: 'month', description: 'For owners who need a dependable business overview.', features: ['1 business location', 'Team scheduling', 'Daily business reports', 'Email support'], popular: false, cta: 'Get Started' },
      { name: 'Operations', price: 99, period: 'month', description: 'For growing teams managing more moving parts.', features: ['Up to 5 locations', 'Advanced reporting', 'Purchase orders', 'Role-based access', 'Priority support'], popular: true, cta: 'Start Free Trial' },
      { name: 'Scale', price: 249, period: 'month', description: 'For multi-location businesses that need deeper control.', features: ['Unlimited locations', 'Custom reports', 'Approval workflows', 'Dedicated onboarding', 'Priority support'], popular: false, cta: 'Contact Sales' },
    ],
  },
  {
    id: 3,
    title: 'Workflow Automation',
    slug: 'workflow-automation',
    tagline: 'Let routine work move itself forward',
    description: 'Automate the small, repeatable tasks that slow your team down. Build reliable workflows for stock alerts, customer follow-ups, reporting, and everyday operational handoffs.',
    features: [
      { title: 'Smart Alerts', description: 'Notify the right people when stock, sales, or operational thresholds need attention.', icon: 'heart' },
      { title: 'Automated Reports', description: 'Schedule routine performance reports to reach your team without manual exports.', icon: 'chart' },
      { title: 'Connected Workflows', description: 'Link the steps in your daily process so handoffs happen consistently.', icon: 'package' },
    ],
    pricing: [
      { name: 'Launch', price: 25, period: 'month', description: 'For simple automations that save time every week.', features: ['5 active workflows', 'Basic triggers', 'Email notifications', 'Community support'], popular: false, cta: 'Get Started' },
      { name: 'Flow', price: 69, period: 'month', description: 'For teams ready to automate their core routines.', features: ['Unlimited workflows', 'Advanced conditions', 'Scheduled reports', 'Priority support'], popular: true, cta: 'Start Free Trial' },
      { name: 'Custom', price: 169, period: 'month', description: 'For tailored automations across a larger operation.', features: ['Custom workflow design', 'Dedicated onboarding', 'Advanced permissions', 'Priority support'], popular: false, cta: 'Talk to Sales' },
    ],
  },
  {
    id: 4,
    title: 'Integrations',
    slug: 'integrations',
    tagline: 'Keep the tools your business uses in sync',
    description: 'Connect Ximo with the services already supporting your business. Keep information flowing between payments, accounting, ecommerce, and the systems your team relies on every day.',
    features: [
      { title: 'Connected Systems', description: 'Bring key business tools together without duplicate data entry.', icon: 'building' },
      { title: 'Data Sync', description: 'Keep important records current across connected services and locations.', icon: 'chart' },
      { title: 'Secure Access', description: 'Control which people and tools can access your operational information.', icon: 'credit-card' },
    ],
    pricing: [
      { name: 'Connect', price: 19, period: 'month', description: 'For one essential connection to your workflow.', features: ['1 integration', 'Daily sync', 'Setup guidance', 'Email support'], popular: false, cta: 'Connect Now' },
      { name: 'Connect Plus', price: 59, period: 'month', description: 'For businesses that rely on a connected toolset.', features: ['Up to 5 integrations', 'Near real-time sync', 'Advanced mapping', 'Priority support'], popular: true, cta: 'Start Free Trial' },
      { name: 'Partner', price: 149, period: 'month', description: 'For custom connections and complex operations.', features: ['Custom integrations', 'Integration monitoring', 'Dedicated setup', 'Priority support'], popular: false, cta: 'Talk to Sales' },
    ],
  },
];

const createItService = ({ id, title, slug, tagline, description, price }) => ({
  id,
  title,
  slug,
  tagline,
  description,
  features: [],
  pricing: [
    {
      name: 'Essential',
      price,
      period: 'month',
      description: `A focused ${title.toLowerCase()} setup for small teams.`,
      features: ['Core service setup', 'Email support', 'Monthly service review', 'Secure access controls'],
      popular: false,
      cta: 'Get Started',
    },
    {
      name: 'Growth',
      price: price * 2,
      period: 'month',
      description: `More capability and support as your ${title.toLowerCase()} needs grow.`,
      features: ['Everything in Essential', 'Advanced configuration', 'Priority support', 'Performance reporting', 'Team onboarding'],
      popular: true,
      cta: 'Start Free Trial',
    },
    {
      name: 'Enterprise',
      price: price * 4,
      period: 'month',
      description: `A tailored ${title.toLowerCase()} solution for larger operations.`,
      features: ['Custom implementation', 'Dedicated success contact', 'Advanced permissions', 'Service-level support', 'Quarterly planning'],
      popular: false,
      cta: 'Talk to Sales',
    },
  ],
});

const additionalItServices = [
  { id: 5, title: 'Custom Software Development', slug: 'custom-software-development', tagline: 'Software shaped around the way you work', description: 'Plan and build reliable internal tools, customer portals, and business software that fit your operation instead of forcing your team into a generic workflow.', price: 149 },
  { id: 6, title: 'Web Application Development', slug: 'web-application-development', tagline: 'Fast, useful web experiences for your business', description: 'Create secure, responsive web applications that give your customers and team a clear place to get work done from any device.', price: 119 },
  { id: 7, title: 'Mobile App Development', slug: 'mobile-app-development', tagline: 'Business tools that move with your team', description: 'Turn important workflows into practical mobile experiences for customers, field teams, and employees on the go.', price: 129 },
  { id: 8, title: 'Cloud Infrastructure', slug: 'cloud-infrastructure', tagline: 'A flexible foundation for modern operations', description: 'Set up and manage secure cloud infrastructure that keeps your applications available, scalable, and ready for growth.', price: 89 },
  { id: 9, title: 'Cybersecurity', slug: 'cybersecurity', tagline: 'Practical protection for your people and data', description: 'Reduce business risk with clear security controls, device protection, access management, and ongoing visibility into vulnerabilities.', price: 99 },
  { id: 10, title: 'Data Backup & Recovery', slug: 'data-backup-recovery', tagline: 'Keep business-critical data recoverable', description: 'Protect your operational data with automated backups, recovery planning, and regular checks that your information can be restored when needed.', price: 49 },
  { id: 11, title: 'Network Setup & Management', slug: 'network-management', tagline: 'Reliable connections for every workday', description: 'Design, secure, and maintain a dependable network for your stores, offices, devices, and team.', price: 69 },
  { id: 12, title: 'IT Help Desk', slug: 'it-help-desk', tagline: 'Responsive support when work gets stuck', description: 'Give your team a clear way to get technical help, resolve issues quickly, and keep small disruptions from becoming lost time.', price: 59 },
  { id: 13, title: 'Database Management', slug: 'database-management', tagline: 'Organized, secure, and dependable business data', description: 'Keep your data structured, available, and performing well with thoughtful database design, monitoring, and maintenance.', price: 79 },
  { id: 14, title: 'API Development & Integration', slug: 'api-development-integration', tagline: 'Make your systems work together', description: 'Connect the tools your business relies on with secure APIs and integrations that reduce duplicate work and keep information moving.', price: 99 },
].map(createItService);

export const mockServices = [...coreServices, ...additionalItServices];

export const getServiceBySlug = (slug) => {
  return mockServices.find((s) => s.slug === slug) || null;
};
