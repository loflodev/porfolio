type StackBadgeProps = {
  label: string;
  variant?: 'default' | 'more';
};

const StackBadge = ({ label, variant = 'default' }: StackBadgeProps) => (
  <li className={`stack-badge ${variant === 'more' ? 'stack-badge-more' : ''}`}>{label}</li>
);

export default StackBadge;
