export const TASKS = [
  {
    id: 'task-1',
    role: 'frontend',
    title: 'Login Page — Mobile Safari Failures',
    difficulty: 'medium',
    impact: 'high',
    estimatedTime: '45 min',
    deadlineMinutes: 50,
    context: `Hey — we've been getting a spike in support tickets since Monday. Users on mobile Safari are reporting that the login form just "doesn't work." They click submit and nothing happens. No error, no feedback, nothing.

Product is on my back about this because it's directly hitting our conversion funnel — mobile is 62% of our traffic and we're losing signups.

I pulled up the login component. Looks like the last sprint someone rewrote the validation and might have broken things. The form doesn't prevent default submission, the email regex is questionable, and the error states aren't being set properly.

I need this fixed today. Don't overthink it — just make the form actually validate and submit correctly. If you run into something weird with the regex, simplify it. We don't need RFC-compliant email validation, just something that works.

Also, make sure users actually SEE the errors. Right now even when validation runs, the UI doesn't reflect it.`,
    starterCode: `import React, { useState } from 'react';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validateEmail = (email) => {
    // Someone wrote this regex... it doesn't work properly
    const re = /^[a-zA-Z0-9]+@[a-zA-Z]+\\.[a-zA-Z]$/;
    return re.test(email);
  };

  const handleSubmit = (e) => {
    // BUG: Missing e.preventDefault()
    let formErrors = {};
    
    if (!email) {
      formErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      formErrors.email = 'Invalid email format';
    }

    if (!password) {
      formErrors.password = 'Password is required';
    } else if (password.length < 6) {
      formErrors.password = 'Password must be at least 6 characters';
    }

    // BUG: Sets errors but doesn't check them before proceeding
    setErrors(formErrors);
    
    // BUG: This runs even when there are errors
    setLoading(true);
    setTimeout(() => {
      console.log('Login attempt:', { email, password });
      setLoading(false);
      // No success/failure handling
    }, 1500);
  };

  return (
    <div className="login-container">
      <h2>Welcome Back</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email</label>
          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
          />
          {/* BUG: Error display uses wrong variable name */}
          {error.email && <span className="error">{error.email}</span>}
        </div>
        
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
          />
          {errors.password && <span className="error">{errors.password}</span>}
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}

export default LoginForm;`,
    expectedBehavior: 'Form should prevent default submission, validate email with a working regex, validate password length, show error messages correctly (fix the variable name bug), and only attempt login when validations pass.',
    hints: [
      'Look at the form submission handler — what happens when the page refreshes?',
      'Check the email regex carefully',
      'Compare how errors are set vs how they\'re displayed in JSX',
      'The login should only fire if there are zero errors',
    ],
    deliverables: [
      'Fix the form submission to prevent page refresh',
      'Fix the email validation regex',
      'Fix the error display variable name mismatch',
      'Only attempt login if all validations pass',
    ],
  },
  {
    id: 'task-2',
    role: 'frontend',
    title: 'Settings Panel — Dark Mode Toggle',
    difficulty: 'medium',
    impact: 'medium',
    estimatedTime: '60 min',
    deadlineMinutes: 65,
    context: `We've been getting feature requests for dark mode for months. Marketing finally agreed to prioritize it because the analytics show 40% of our users are active after 9pm.

I started a settings panel component last week but got pulled into the payments bug. The toggle UI is roughed in but doesn't actually DO anything. The theme context exists but isn't wired up, and the CSS variables for dark mode need to be applied properly.

Right now clicking the toggle does nothing. I need you to:
1. Make the toggle actually switch themes
2. Store the preference so it persists across sessions  
3. Make sure the settings panel itself responds to the theme change

Don't build the entire dark theme CSS — just wire up the mechanism. The design team will handle the full color pass later. We just need the infrastructure working.

One more thing — the toggle component has a visual bug where it doesn't animate smoothly. If you can fix that while you're in there, great.`,
    starterCode: `import React, { useState } from 'react';

function SettingsPanel() {
  // BUG: Using local state instead of theme context
  const [darkMode, setDarkMode] = useState(false);

  const handleToggle = () => {
    // BUG: Only toggles local state, doesn't affect app theme
    setDarkMode(!darkMode);
    console.log('Theme toggled'); // This is all it does
  };

  return (
    <div className="settings-panel" style={{
      backgroundColor: '#ffffff',  // BUG: Hardcoded colors
      color: '#333333',
      padding: '24px',
      borderRadius: '12px',
      maxWidth: '600px',
      margin: '0 auto'
    }}>
      <h2 style={{ marginBottom: '24px' }}>Settings</h2>
      
      <div className="setting-row" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 0',
        borderBottom: '1px solid #eee'
      }}>
        <div>
          <h3 style={{ fontSize: '16px', marginBottom: '4px' }}>Dark Mode</h3>
          <p style={{ fontSize: '14px', color: '#888' }}>
            Switch between light and dark themes
          </p>
        </div>
        
        {/* BUG: Toggle doesn't animate, visual state doesn't match */}
        <div 
          onClick={handleToggle}
          style={{
            width: '50px',
            height: '26px',
            backgroundColor: darkMode ? '#4CAF50' : '#ccc',
            borderRadius: '13px',
            cursor: 'pointer',
            position: 'relative',
            // Missing transition property
          }}
        >
          <div style={{
            width: '22px',
            height: '22px',
            backgroundColor: 'white',
            borderRadius: '50%',
            position: 'absolute',
            top: '2px',
            left: darkMode ? '2px' : '26px',  // BUG: left values are swapped
            // Missing transition property
          }} />
        </div>
      </div>

      <div className="setting-row" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 0',
        borderBottom: '1px solid #eee'
      }}>
        <div>
          <h3 style={{ fontSize: '16px', marginBottom: '4px' }}>Notifications</h3>
          <p style={{ fontSize: '14px', color: '#888' }}>
            Receive task and deadline notifications
          </p>
        </div>
        <input type="checkbox" defaultChecked />
      </div>

      <div className="setting-row" style={{
        padding: '16px 0',
      }}>
        <div>
          <h3 style={{ fontSize: '16px', marginBottom: '4px' }}>Language</h3>
          <p style={{ fontSize: '14px', color: '#888' }}>
            Select your preferred language
          </p>
        </div>
        {/* This select doesn't do anything either */}
        <select style={{ marginTop: '8px', padding: '8px', borderRadius: '6px' }}>
          <option>English</option>
          <option>Spanish</option>
          <option>French</option>
        </select>
      </div>
    </div>
  );
}

export default SettingsPanel;`,
    expectedBehavior: 'Toggle should switch app theme using context, persist choice in localStorage, animate smoothly, and the panel should use CSS variables instead of hardcoded colors.',
    hints: [
      'The toggle state needs to come from a shared context, not local state',
      'Check the toggle knob positioning — left values seem backwards',
      'CSS transitions need to be added for smooth animation',
      'Replace hardcoded color strings with CSS custom properties',
    ],
    deliverables: [
      'Wire toggle to theme context',
      'Persist theme preference in localStorage',
      'Fix toggle animation and positioning',
      'Replace hardcoded colors with theme-aware styling',
    ],
  },
  {
    id: 'task-3',
    role: 'frontend',
    title: 'Product Page — Broken "Add to Cart" Button',
    difficulty: 'easy',
    impact: 'high',
    estimatedTime: '30 min',
    deadlineMinutes: 35,
    context: `This is urgent. The "Add to Cart" button on the product detail page stopped working after yesterday's deployment. We're literally losing revenue every hour this is broken.

QA caught it this morning — clicking the button does nothing. No console errors visible at first glance, but the cart count doesn't update and the confirmation toast never appears.

I suspect someone broke the onClick handler during the component refactor. I don't have time to dig into it — I need you on this NOW.

If you can reproduce the issue and fix it within the next 30 minutes, that would be ideal. Also, the button should show a brief loading state while the item is being added. Right now there's no feedback at all — users don't know if their click registered.

Don't touch the styling or layout. Just fix the functionality.`,
    starterCode: `import React, { useState } from 'react';

function ProductCard({ product }) {
  const [cartItems, setCartItems] = useState([]);
  const [showToast, setShowToast] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const addToCart = (item) => {
    // BUG: This function never gets called because of the onClick issue below
    setIsAdding(true);
    
    setTimeout(() => {
      // BUG: Creates new array but doesn't spread existing items
      setCartItems([item]);
      setIsAdding(false);
      
      // BUG: Toast shows but never hides
      setShowToast(true);
    }, 800);
  };

  const getCartCount = () => {
    // BUG: Returns undefined sometimes
    return cartItems?.length;
  };

  return (
    <div className="product-card" style={{
      border: '1px solid #e0e0e0',
      borderRadius: '12px',
      padding: '20px',
      maxWidth: '400px',
    }}>
      <div className="product-image" style={{
        width: '100%',
        height: '200px',
        backgroundColor: '#f0f0f0',
        borderRadius: '8px',
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#999',
      }}>
        Product Image
      </div>

      <h3 style={{ marginBottom: '8px' }}>
        {product?.name || 'Premium Wireless Headphones'}
      </h3>
      
      <p style={{ color: '#666', fontSize: '14px', marginBottom: '12px' }}>
        {product?.description || 'High-quality wireless headphones with noise cancellation'}
      </p>
      
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '16px'
      }}>
        <span style={{ fontSize: '24px', fontWeight: 'bold' }}>
          \${product?.price || '99.99'}
        </span>
        <span style={{ fontSize: '14px', color: '#888' }}>
          Cart: {getCartCount()} items
        </span>
      </div>

      {/* BUG: onClick is calling the function immediately instead of passing as callback */}
      <button
        onClick={addToCart(product)}
        disabled={isAdding}
        style={{
          width: '100%',
          padding: '12px',
          backgroundColor: isAdding ? '#ccc' : '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '16px',
          cursor: isAdding ? 'not-allowed' : 'pointer',
        }}
      >
        {isAdding ? 'Adding...' : 'Add to Cart'}
      </button>

      {/* BUG: Toast never disappears */}
      {showToast && (
        <div style={{
          marginTop: '12px',
          padding: '12px',
          backgroundColor: '#e8f5e9',
          borderRadius: '8px',
          color: '#2e7d32',
          textAlign: 'center',
        }}>
          ✓ Added to cart successfully!
        </div>
      )}
    </div>
  );
}

export default ProductCard;`,
    expectedBehavior: 'Add to Cart button should correctly add items to cart array, show loading state, display and auto-hide toast notification, and update cart count.',
    hints: [
      'Look at how the onClick handler is being called — is it invoked immediately?',
      'The cart state should accumulate items, not replace them',
      'The toast should disappear after a few seconds',
    ],
    deliverables: [
      'Fix the onClick handler to use a callback',
      'Fix cart state to accumulate items properly',
      'Add auto-dismiss for the toast notification',
    ],
  },
  {
    id: 'task-4',
    role: 'frontend',
    title: 'User Profile — Component Refactor',
    difficulty: 'hard',
    impact: 'medium',
    estimatedTime: '90 min',
    deadlineMinutes: 95,
    context: `I'm assigning you a refactoring task. This one isn't urgent — no users are impacted right now — but it's blocking future work.

The UserProfile component was written by a contractor who left two months ago. It works, technically, but it's a maintenance nightmare. Everything is in one 150-line component with inline styles, duplicated logic, hardcoded values, and no separation of concerns.

We need to extend the profile page next sprint to add activity history and notification preferences. But nobody wants to touch this code — it's fragile and hard to reason about.

I need you to refactor it. Break it into smaller components, extract the styles, and make it maintainable. Don't change the visual output — it should look exactly the same after your refactor. The test suite runs screenshot diffs, so any visual change will be caught.

Also, there's a bug where the "Edit Profile" button doesn't actually toggle edit mode. Fix that while you're in there.

Take your time on this one. I'd rather it be done right than done fast.`,
    starterCode: `import React, { useState } from 'react';

// This entire component needs refactoring
// Everything is crammed into one file with inline styles
function UserProfile() {
  const [user, setUser] = useState({
    name: 'Sarah Chen',
    email: 'sarah.chen@company.com',
    role: 'Frontend Developer',
    department: 'Engineering',
    joinDate: '2024-03-15',
    avatar: null,
    bio: 'Passionate about building great user experiences. Previously at StartupXYZ.',
    skills: ['React', 'TypeScript', 'Node.js', 'CSS', 'GraphQL'],
    stats: { projects: 12, commits: 847, reviews: 156 }
  });
  
  // BUG: isEditing is set but never toggled properly
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});

  // This function is never called correctly
  const handleEdit = () => {
    // BUG: Condition is inverted - sets form data when EXITING edit mode
    if (isEditing) {
      setEditForm({ name: user.name, email: user.email, bio: user.bio });
    }
    // Missing: setIsEditing toggle
  };

  const handleSave = () => {
    // BUG: Spreads editForm into user but editForm might be empty
    setUser({ ...user, ...editForm });
    setIsEditing(false);
  };

  // Duplicated date formatting logic
  const formatDate = (date) => {
    const d = new Date(date);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();
  };

  return (
    <div style={{
      maxWidth: '800px',
      margin: '0 auto',
      padding: '24px',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Header Section - too much inline styling */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        padding: '24px',
        backgroundColor: '#f8f9fa',
        borderRadius: '12px',
        marginBottom: '24px',
        border: '1px solid #e0e0e0'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          backgroundColor: '#6366f1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '32px',
          fontWeight: 'bold',
        }}>
          {user.name.charAt(0)}
        </div>
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: '0 0 4px 0', fontSize: '24px' }}>{user.name}</h1>
          <p style={{ margin: '0 0 2px 0', color: '#666' }}>{user.role}</p>
          <p style={{ margin: 0, fontSize: '14px', color: '#999' }}>
            {user.department} · Joined {formatDate(user.joinDate)}
          </p>
        </div>
        <button 
          onClick={handleEdit}
          style={{
            padding: '8px 16px',
            backgroundColor: isEditing ? '#ef4444' : '#6366f1',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

      {/* Bio Section */}
      <div style={{
        padding: '20px',
        backgroundColor: '#f8f9fa',
        borderRadius: '12px',
        marginBottom: '24px',
        border: '1px solid #e0e0e0'
      }}>
        <h3 style={{ marginTop: 0, marginBottom: '12px' }}>About</h3>
        {isEditing ? (
          <textarea
            value={editForm.bio || ''}
            onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #ddd',
              fontSize: '14px',
              minHeight: '100px',
              resize: 'vertical'
            }}
          />
        ) : (
          <p style={{ margin: 0, color: '#555', lineHeight: '1.6' }}>{user.bio}</p>
        )}
      </div>

      {/* Stats Section - hardcoded, not reusable */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div style={{
          padding: '20px',
          backgroundColor: '#f8f9fa',
          borderRadius: '12px',
          textAlign: 'center',
          border: '1px solid #e0e0e0'
        }}>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#6366f1' }}>
            {user.stats.projects}
          </div>
          <div style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
            Projects
          </div>
        </div>
        <div style={{
          padding: '20px',
          backgroundColor: '#f8f9fa',
          borderRadius: '12px',
          textAlign: 'center',
          border: '1px solid #e0e0e0'
        }}>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#6366f1' }}>
            {user.stats.commits}
          </div>
          <div style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
            Commits
          </div>
        </div>
        <div style={{
          padding: '20px',
          backgroundColor: '#f8f9fa',
          borderRadius: '12px',
          textAlign: 'center',
          border: '1px solid #e0e0e0'
        }}>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#6366f1' }}>
            {user.stats.reviews}
          </div>
          <div style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
            Reviews
          </div>
        </div>
      </div>

      {/* Skills Section */}
      <div style={{
        padding: '20px',
        backgroundColor: '#f8f9fa',
        borderRadius: '12px',
        border: '1px solid #e0e0e0'
      }}>
        <h3 style={{ marginTop: 0, marginBottom: '12px' }}>Skills</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {user.skills.map((skill, index) => (
            <span key={index} style={{
              padding: '6px 14px',
              backgroundColor: '#e8e5ff',
              color: '#6366f1',
              borderRadius: '20px',
              fontSize: '13px',
              fontWeight: '500'
            }}>
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Save button when editing */}
      {isEditing && (
        <div style={{ marginTop: '24px', textAlign: 'right' }}>
          <button
            onClick={handleSave}
            style={{
              padding: '10px 24px',
              backgroundColor: '#22c55e',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            Save Changes
          </button>
        </div>
      )}
    </div>
  );
}

export default UserProfile;`,
    expectedBehavior: 'Component should be broken into smaller sub-components (ProfileHeader, Bio, Stats, Skills), styles should be extracted to CSS classes, edit mode should toggle correctly, and save should work properly.',
    hints: [
      'The handleEdit function has an inverted condition and is missing the toggle',
      'Extract each section into its own component',
      'Replace inline styles with CSS classes or a styles object',
      'The stats section follows a repeating pattern — make it data-driven',
    ],
    deliverables: [
      'Fix edit mode toggle bug',
      'Break into smaller components',
      'Extract inline styles to CSS',
      'Make stats section data-driven and reusable',
    ],
  },
  {
    id: 'task-5',
    role: 'frontend',
    title: 'Product Listing — Performance Optimization',
    difficulty: 'hard',
    impact: 'high',
    estimatedTime: '75 min',
    deadlineMinutes: 80,
    context: `Performance review on the product listing page came back and it's bad. The page is rendering noticeably slow — we've had users complain about lag when scrolling and filtering.

I profiled it quickly. The main issues:
- The component re-renders entirely on every filter change
- Product cards aren't memoized, so even unchanged cards re-render
- The search/filter function runs on every keystroke with no debounce
- There's an inline sort function in the render that creates a new array every render

Lighthouse is giving us a 42 on performance for this page. We need to get it above 75, minimum.

Don't rewrite the whole thing. Just optimize what's there. I want to see you use proper React patterns — useMemo, useCallback, React.memo, debouncing. Show me you understand WHY each optimization matters, not just that you can apply them.

If you want to add a note in the comments explaining your reasoning for each optimization, that would be great for the PR review.`,
    starterCode: `import React, { useState, useEffect } from 'react';

// PERFORMANCE ISSUE: This component re-renders too frequently
function ProductList() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [loading, setLoading] = useState(true);

  // Simulated API call
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setProducts(generateProducts(500)); // 500 products - heavy list
      setLoading(false);
    }, 1000);
  }, []);

  // PERFORMANCE ISSUE: This runs on EVERY render, not just when dependencies change
  const filteredProducts = products
    .filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = category === 'all' || p.category === category;
      return matchesSearch && matchesCategory;
    })
    // PERFORMANCE ISSUE: Sort creates new array every render
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      return 0;
    });

  // PERFORMANCE ISSUE: No debounce on search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const categories = ['all', 'electronics', 'clothing', 'books', 'home', 'sports'];

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '60px' }}>Loading products...</div>;
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
      <h1 style={{ marginBottom: '24px' }}>Products ({filteredProducts.length})</h1>
      
      {/* Search and Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={handleSearch}
          style={{
            flex: 1,
            minWidth: '200px',
            padding: '10px 16px',
            borderRadius: '8px',
            border: '1px solid #ddd',
            fontSize: '14px'
          }}
        />
        
        <select 
          value={category} 
          onChange={(e) => setCategory(e.target.value)}
          style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #ddd' }}
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </option>
          ))}
        </select>

        <select 
          value={sortBy} 
          onChange={(e) => setSortBy(e.target.value)}
          style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #ddd' }}
        >
          <option value="name">Sort by Name</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="rating">Highest Rated</option>
        </select>
      </div>

      {/* Product Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '20px'
      }}>
        {filteredProducts.map(product => (
          // PERFORMANCE ISSUE: ProductCard is not memoized
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}

// PERFORMANCE ISSUE: This component re-renders even when props haven't changed
function ProductCard({ product }) {
  // PERFORMANCE ISSUE: Inline function creates new reference every render
  const formatPrice = (price) => {
    return '$' + price.toFixed(2);
  };

  // PERFORMANCE ISSUE: Expensive computation done on every render
  const ratingStars = Array.from({ length: 5 }, (_, i) => (
    <span key={i} style={{ color: i < Math.round(product.rating) ? '#fbbf24' : '#e0e0e0' }}>
      ★
    </span>
  ));

  return (
    <div style={{
      border: '1px solid #e0e0e0',
      borderRadius: '12px',
      overflow: 'hidden',
      transition: 'transform 0.2s',
    }}>
      <div style={{
        height: '180px',
        backgroundColor: '#f3f4f6',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#9ca3af'
      }}>
        📦 {product.category}
      </div>
      <div style={{ padding: '16px' }}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>{product.name}</h3>
        <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#666' }}>
          {product.description}
        </p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '18px', fontWeight: 'bold' }}>{formatPrice(product.price)}</span>
          <div>{ratingStars}</div>
        </div>
      </div>
    </div>
  );
}

// Helper to generate mock products
function generateProducts(count) {
  const categories = ['electronics', 'clothing', 'books', 'home', 'sports'];
  const adjectives = ['Premium', 'Classic', 'Modern', 'Essential', 'Deluxe', 'Pro', 'Ultra'];
  const nouns = ['Widget', 'Gadget', 'Tool', 'Kit', 'Set', 'Pack', 'Bundle'];
  
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: adjectives[i % adjectives.length] + ' ' + nouns[i % nouns.length] + ' ' + (i + 1),
    description: 'High-quality product with excellent features and great value for everyday use.',
    price: Math.round((Math.random() * 200 + 10) * 100) / 100,
    category: categories[i % categories.length],
    rating: Math.round((Math.random() * 3 + 2) * 10) / 10,
  }));
}

export default ProductList;`,
    expectedBehavior: 'Use useMemo for filtering/sorting, useCallback for handlers, React.memo for ProductCard, implement debounced search. Component should re-render minimally.',
    hints: [
      'useMemo can prevent recalculating filtered/sorted products on every render',
      'React.memo wraps a component to skip re-renders when props haven\'t changed',
      'useCallback ensures function references are stable between renders',
      'Debouncing search means waiting a brief moment after the user stops typing before filtering',
    ],
    deliverables: [
      'Wrap filter/sort logic in useMemo with proper dependencies',
      'Wrap ProductCard in React.memo',
      'Use useCallback for event handlers',
      'Implement debounced search input',
    ],
  },

  // ===== BACKEND TASKS =====
  {
    id: 'be-task-1',
    role: 'backend',
    title: 'REST API — Broken User Endpoint',
    difficulty: 'easy',
    impact: 'high',
    estimatedTime: '30 min',
    deadlineMinutes: 35,
    context: `The GET /api/users/:id endpoint is returning 500 errors in production. The error logs show "Cannot read property 'rows' of undefined." Looks like the database query function isn't being awaited properly, and the error handling is missing. Fix the async/await issues, add proper error handling, and make sure it returns 404 for non-existent users.`,
    starterCode: `const express = require('express');
const router = express.Router();
const db = require('../db');

// BUG: Missing async keyword
router.get('/users/:id', (req, res) => {
  const { id } = req.params;

  // BUG: db.query returns a promise but isn't awaited
  const result = db.query('SELECT * FROM users WHERE id = $1', [id]);

  // BUG: No check if user exists
  // BUG: No try/catch for error handling
  res.json(result.rows[0]);
});

// BUG: No input validation
router.post('/users', (req, res) => {
  const { name, email } = req.body;

  const result = db.query(
    'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
    [name, email]
  );

  res.status(200).json(result.rows[0]); // Should be 201
});

module.exports = router;`,
    expectedBehavior: 'Endpoints should use async/await, handle errors with try/catch, return proper HTTP status codes, and validate input.',
    hints: ['Add async to route handlers', 'Await the db.query calls', 'Add try/catch blocks', 'Return 404 when user not found'],
    deliverables: ['Fix async/await usage', 'Add error handling', 'Return correct status codes', 'Add input validation'],
  },
  {
    id: 'be-task-2',
    role: 'backend',
    title: 'Authentication — JWT Token Bugs',
    difficulty: 'medium',
    impact: 'high',
    estimatedTime: '45 min',
    deadlineMinutes: 50,
    context: `Our JWT authentication middleware has several issues. Tokens are being generated without expiration, the verification doesn't handle expired tokens gracefully, and the refresh token logic is broken. Users are getting logged out randomly while others stay logged in forever. Fix the token generation, verification middleware, and refresh flow.`,
    starterCode: `const jwt = require('jsonwebtoken');
const SECRET = 'mysecret'; // BUG: Hardcoded secret

function generateToken(user) {
  // BUG: No expiration set
  // BUG: Including password in payload
  return jwt.sign(
    { id: user.id, email: user.email, password: user.password },
    SECRET
  );
}

function verifyToken(req, res, next) {
  const token = req.headers.authorization;
  // BUG: Doesn't strip "Bearer " prefix

  if (!token) {
    return res.status(401).json({ error: 'No token' });
  }

  // BUG: No try/catch, crashes on invalid token
  const decoded = jwt.verify(token, SECRET);
  req.user = decoded;
  next();
}

function refreshToken(req, res) {
  const { token } = req.body;
  // BUG: Verifies with wrong error handling
  // BUG: Generates new token without checking if user still exists
  const decoded = jwt.verify(token, SECRET);
  const newToken = generateToken(decoded);
  res.json({ token: newToken });
}

module.exports = { generateToken, verifyToken, refreshToken };`,
    expectedBehavior: 'Tokens should expire, secrets should use env vars, Bearer prefix handled, passwords excluded from payload, proper error handling.',
    hints: ['Use process.env for secrets', 'Add expiresIn to jwt.sign', 'Strip "Bearer " from authorization header', 'Never include passwords in JWT payload'],
    deliverables: ['Fix token generation with expiry', 'Use environment variable for secret', 'Fix Bearer token parsing', 'Add proper error handling'],
  },
  {
    id: 'be-task-3',
    role: 'backend',
    title: 'Database — N+1 Query Problem',
    difficulty: 'medium',
    impact: 'high',
    estimatedTime: '60 min',
    deadlineMinutes: 65,
    context: `The /api/posts endpoint is taking 8+ seconds to load. Profiling shows we're making 1 query to get all posts, then N individual queries to get each post's author. Classic N+1 problem. We have 500+ posts and the page is unusable. Fix the queries to use JOINs or batch loading. Also, add pagination — we shouldn't return all 500 posts at once.`,
    starterCode: `const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/posts', async (req, res) => {
  try {
    // Gets all posts
    const posts = await db.query('SELECT * FROM posts');

    // BUG: N+1 problem - queries author for EACH post individually
    const postsWithAuthors = [];
    for (const post of posts.rows) {
      const author = await db.query(
        'SELECT name, avatar FROM users WHERE id = $1',
        [post.author_id]
      );
      postsWithAuthors.push({
        ...post,
        author: author.rows[0]
      });
    }

    // BUG: No pagination - returns ALL posts
    // BUG: No sorting option
    res.json(postsWithAuthors);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;`,
    expectedBehavior: 'Use a JOIN query to fetch posts with authors in one query. Add pagination with limit/offset. Add sorting parameter.',
    hints: ['Use SQL JOIN to combine posts and users tables', 'Add LIMIT and OFFSET for pagination', 'Accept page and limit as query params', 'Add ORDER BY support'],
    deliverables: ['Replace N+1 queries with a JOIN', 'Add pagination support', 'Add sorting parameter', 'Return pagination metadata'],
  },
  {
    id: 'be-task-4',
    role: 'backend',
    title: 'Rate Limiter — Middleware Implementation',
    difficulty: 'hard',
    impact: 'high',
    estimatedTime: '75 min',
    deadlineMinutes: 80,
    context: `We got hit by a brute force attack last week on the login endpoint. We need a rate limiting middleware. The current attempt has bugs: it doesn't clean up old entries (memory leak), the sliding window logic is wrong, and it doesn't handle distributed setups. Fix the implementation and add proper headers (X-RateLimit-Remaining, etc).`,
    starterCode: `// Rate limiter middleware - has several bugs

const requestCounts = {}; // BUG: Never cleaned up - memory leak

function rateLimiter(maxRequests, windowMs) {
  return (req, res, next) => {
    const key = req.ip;

    // BUG: Doesn't initialize properly
    if (!requestCounts[key]) {
      requestCounts[key] = { count: 0, startTime: Date.now() };
    }

    const record = requestCounts[key];
    const now = Date.now();
    const timePassed = now - record.startTime;

    // BUG: Window reset logic is wrong
    // Should reset count when window expires, but this never resets
    if (timePassed > windowMs) {
      record.count = record.count; // BUG: Should reset to 0
      // Missing: record.startTime = now;
    }

    record.count++;

    if (record.count > maxRequests) {
      // BUG: No rate limit headers
      return res.status(429).json({ error: 'Too many requests' });
    }

    // BUG: Missing rate limit headers for successful requests
    next();
  };
}

module.exports = rateLimiter;`,
    expectedBehavior: 'Properly track requests per IP with sliding window, reset counts, add rate limit headers, clean up old entries.',
    hints: ['Reset count when window expires', 'Add X-RateLimit-Limit and X-RateLimit-Remaining headers', 'Use setInterval to clean up old entries', 'Consider using a Map instead of plain object'],
    deliverables: ['Fix window reset logic', 'Add rate limit response headers', 'Implement cleanup for old entries', 'Add Retry-After header on 429'],
  },
  {
    id: 'be-task-5',
    role: 'backend',
    title: 'File Upload — Security Vulnerabilities',
    difficulty: 'hard',
    impact: 'high',
    estimatedTime: '90 min',
    deadlineMinutes: 95,
    context: `Security audit flagged our file upload endpoint. It accepts any file type (including .exe), doesn't validate file size on the server, allows path traversal in filenames, and stores files with their original names (collision risk). Fix all the security issues: validate types, limit sizes, sanitize filenames, and generate unique names.`,
    starterCode: `const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// BUG: No file type filtering
// BUG: No file size limit
const upload = multer({ dest: 'uploads/' });

const router = express.Router();

router.post('/upload', upload.single('file'), (req, res) => {
  // BUG: No check if file was actually uploaded
  const file = req.file;

  // BUG: Using original filename - path traversal risk
  // BUG: No filename sanitization
  const targetPath = path.join('uploads', file.originalname);

  // BUG: Synchronous file operation in async handler
  fs.renameSync(file.path, targetPath);

  // BUG: Exposing internal server path
  res.json({
    message: 'File uploaded',
    path: targetPath,
    size: file.size
  });
});

module.exports = router;`,
    expectedBehavior: 'Validate file types (images only), limit file size, sanitize filenames, generate unique names, use async file operations, dont expose server paths.',
    hints: ['Use multer fileFilter to restrict types', 'Add limits.fileSize to multer config', 'Use uuid or crypto for unique filenames', 'Sanitize original filename to prevent path traversal'],
    deliverables: ['Add file type validation', 'Add file size limits', 'Generate safe unique filenames', 'Use async file operations'],
  },

  // ===== AI/ML TASKS =====
  {
    id: 'ai-task-1',
    role: 'aiml',
    title: 'Data Pipeline — Broken CSV Parser',
    difficulty: 'easy',
    impact: 'high',
    estimatedTime: '30 min',
    deadlineMinutes: 35,
    context: `The data ingestion pipeline is failing silently. The CSV parser crashes on rows with missing values, doesn't handle quoted fields with commas, and the data type conversion is wrong (treating all numbers as strings). The downstream model is getting garbage data. Fix the parser to handle edge cases properly.`,
    starterCode: `import pandas as pd
import numpy as np

def load_and_clean_data(filepath):
    # BUG: No error handling for file not found
    # BUG: No encoding specification - fails on UTF-8 BOM
    df = pd.read_csv(filepath)

    # BUG: Drops ALL rows with ANY missing value - too aggressive
    df = df.dropna()

    # BUG: Doesn't handle mixed types in columns
    # BUG: No validation of expected columns
    expected_columns = ['id', 'age', 'income', 'category', 'score']

    # BUG: String to numeric conversion without error handling
    df['age'] = int(df['age'])  # Crashes on non-numeric
    df['income'] = float(df['income'])
    df['score'] = float(df['score'])

    # BUG: No outlier detection
    # BUG: No duplicate removal

    return df

def get_summary_stats(df):
    # BUG: Doesn't handle empty dataframe
    stats = {
        'mean_age': df['age'].mean(),
        'median_income': df['income'].median(),
        'score_std': df['score'].std(),
        # BUG: Category counts might fail if column is missing
        'categories': df['category'].value_counts().to_dict()
    }
    return stats`,
    expectedBehavior: 'Parser should handle missing values gracefully, convert types safely, validate columns, detect outliers, and remove duplicates.',
    hints: ['Use pd.to_numeric with errors="coerce"', 'Use fillna or dropna with subset', 'Validate expected columns exist', 'Add try/except for file loading'],
    deliverables: ['Fix CSV loading with proper encoding', 'Handle missing values smartly', 'Fix type conversions', 'Add data validation'],
  },
  {
    id: 'ai-task-2',
    role: 'aiml',
    title: 'Model Training — Data Leakage Bug',
    difficulty: 'medium',
    impact: 'high',
    estimatedTime: '45 min',
    deadlineMinutes: 50,
    context: `Our classification model shows 98% accuracy in training but only 52% in production. Classic data leakage. The preprocessing pipeline normalizes data BEFORE splitting, the target variable is being used as a feature, and cross-validation is done wrong. Fix the pipeline to prevent data leakage.`,
    starterCode: `from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
import pandas as pd

def train_model(df):
    # BUG: Target column 'churn' is included in features
    X = df.drop(columns=['customer_id'])  # Should also drop 'churn'
    y = df['churn']

    # BUG: Scaling BEFORE splitting - data leakage!
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # BUG: No random_state - results not reproducible
    X_train, X_test, y_train, y_test = train_test_split(
        X_scaled, y, test_size=0.2
    )

    # BUG: No hyperparameter tuning
    # BUG: No class imbalance handling
    model = RandomForestClassifier()
    model.fit(X_train, y_train)

    # BUG: Only checking accuracy - misleading for imbalanced data
    train_acc = accuracy_score(y_train, model.predict(X_train))
    test_acc = accuracy_score(y_test, model.predict(X_test))

    print(f'Train: {train_acc}, Test: {test_acc}')
    return model

# No model serialization/saving`,
    expectedBehavior: 'Split data BEFORE preprocessing, exclude target from features, use stratified split, handle class imbalance, use proper metrics.',
    hints: ['Drop target column from features', 'Split first, then fit scaler on train only', 'Use stratify parameter in train_test_split', 'Add precision, recall, F1 besides accuracy'],
    deliverables: ['Fix data leakage in preprocessing', 'Remove target from features', 'Add stratified splitting', 'Use proper evaluation metrics'],
  },
  {
    id: 'ai-task-3',
    role: 'aiml',
    title: 'NLP Pipeline — Text Preprocessing Bugs',
    difficulty: 'medium',
    impact: 'medium',
    estimatedTime: '60 min',
    deadlineMinutes: 65,
    context: `The sentiment analysis pipeline is producing terrible results. The text preprocessing has multiple issues: it's removing important negation words during stopword removal ("not", "no", "never"), the tokenizer splits contractions wrong, and the TF-IDF vectorizer isn't handling unseen vocabulary in production. Fix the preprocessing pipeline.`,
    starterCode: `import re
from collections import Counter

def preprocess_text(text):
    # BUG: Lowercasing before entity extraction loses info
    text = text.lower()

    # BUG: This regex removes ALL punctuation including apostrophes
    # Breaks contractions: "don't" -> "don t"
    text = re.sub(r'[^a-z\\s]', '', text)

    # BUG: Removes negation words that are crucial for sentiment
    stopwords = {'the','a','an','is','are','was','were','be',
                 'not','no','never','nor',  # These should NOT be removed
                 'in','on','at','to','for','of','with','by'}

    words = text.split()
    words = [w for w in words if w not in stopwords]

    # BUG: No stemming or lemmatization
    # BUG: No handling of repeated characters ("soooo goood")

    return ' '.join(words)

def build_vocabulary(texts, max_features=1000):
    word_counts = Counter()
    for text in texts:
        # BUG: Counting on raw text, not preprocessed
        words = text.split()
        word_counts.update(words)

    # BUG: Returns all words, ignoring max_features
    vocab = {word: idx for idx, (word, count) in enumerate(word_counts.items())}
    return vocab

def vectorize(text, vocab):
    words = preprocess_text(text).split()
    # BUG: Crashes on words not in vocabulary
    vector = [0] * len(vocab)
    for word in words:
        vector[vocab[word]] += 1  # KeyError on unseen words
    return vector`,
    expectedBehavior: 'Keep negation words, handle contractions, limit vocabulary size, handle unseen words gracefully, normalize repeated characters.',
    hints: ['Remove negation words from stopword list', 'Handle apostrophes separately from other punctuation', 'Use most_common(max_features) for vocabulary', 'Use vocab.get(word, -1) for unseen words'],
    deliverables: ['Fix stopword list to keep negation words', 'Fix tokenization for contractions', 'Limit vocabulary to max_features', 'Handle unseen words in vectorization'],
  },
  {
    id: 'ai-task-4',
    role: 'aiml',
    title: 'Neural Network — Vanishing Gradient Fix',
    difficulty: 'hard',
    impact: 'high',
    estimatedTime: '75 min',
    deadlineMinutes: 80,
    context: `The deep learning model for image classification isn't learning. Loss plateaus after epoch 1 and accuracy stays at random chance. The architecture has vanishing gradient issues: sigmoid activations in deep layers, no batch normalization, poor weight initialization, and the learning rate is way too high. Fix the architecture.`,
    starterCode: `import numpy as np

class NeuralNetwork:
    def __init__(self, layer_sizes):
        self.weights = []
        self.biases = []
        for i in range(len(layer_sizes) - 1):
            # BUG: Large random weights cause saturation with sigmoid
            w = np.random.randn(layer_sizes[i], layer_sizes[i+1]) * 1.0
            b = np.zeros((1, layer_sizes[i+1]))
            self.weights.append(w)
            self.biases.append(b)

    # BUG: Sigmoid causes vanishing gradients in deep networks
    def sigmoid(self, x):
        return 1 / (1 + np.exp(-x))

    def sigmoid_derivative(self, x):
        return x * (1 - x)

    def forward(self, X):
        self.activations = [X]
        current = X
        for w, b in zip(self.weights, self.biases):
            z = np.dot(current, w) + b
            # BUG: Using sigmoid for ALL layers including hidden
            current = self.sigmoid(z)
            self.activations.append(current)
        return current

    def backward(self, X, y, learning_rate=1.0):  # BUG: LR too high
        m = X.shape[0]
        deltas = [None] * len(self.weights)

        # Output layer error
        error = y - self.activations[-1]
        deltas[-1] = error * self.sigmoid_derivative(self.activations[-1])

        # Hidden layers
        for i in range(len(self.weights) - 2, -1, -1):
            error = deltas[i+1].dot(self.weights[i+1].T)
            deltas[i] = error * self.sigmoid_derivative(self.activations[i+1])

        # Update weights - BUG: No gradient clipping
        for i in range(len(self.weights)):
            self.weights[i] += self.activations[i].T.dot(deltas[i]) * learning_rate / m
            self.biases[i] += np.sum(deltas[i], axis=0, keepdims=True) * learning_rate / m`,
    expectedBehavior: 'Use ReLU for hidden layers, He initialization, lower learning rate, add gradient clipping, keep sigmoid only for output layer.',
    hints: ['Replace sigmoid with ReLU for hidden layers', 'Use He initialization: * np.sqrt(2/n)', 'Lower learning rate to 0.01 or 0.001', 'Add gradient clipping to prevent explosion'],
    deliverables: ['Replace sigmoid with ReLU in hidden layers', 'Fix weight initialization', 'Lower learning rate', 'Add gradient clipping'],
  },
  {
    id: 'ai-task-5',
    role: 'aiml',
    title: 'Evaluation — Broken Cross-Validation',
    difficulty: 'hard',
    impact: 'high',
    estimatedTime: '90 min',
    deadlineMinutes: 95,
    context: `The model evaluation pipeline is giving unreliable results. The k-fold cross-validation implementation has bugs: folds aren't stratified (class imbalance ignored), the same random seed isn't set (results vary), metrics are computed wrong for multiclass, and there's no confidence interval on the scores. Fix the evaluation pipeline.`,
    starterCode: `import numpy as np
from sklearn.metrics import accuracy_score, f1_score

def cross_validate(X, y, model_class, k=5):
    n = len(X)
    fold_size = n // k
    scores = []

    # BUG: No shuffling before splitting
    # BUG: Not stratified - class distribution may vary per fold

    for i in range(k):
        # BUG: Last fold may miss remaining samples
        val_start = i * fold_size
        val_end = (i + 1) * fold_size

        X_val = X[val_start:val_end]
        y_val = y[val_start:val_end]

        # BUG: Includes validation data in training
        X_train = np.concatenate([X[:val_start], X[val_end:]])
        y_train = np.concatenate([y[:val_start], y[val_end:]])

        model = model_class()
        model.fit(X_train, y_train)

        preds = model.predict(X_val)

        # BUG: Only accuracy - not appropriate for all problems
        score = accuracy_score(y_val, preds)
        scores.append(score)

    # BUG: No confidence interval
    # BUG: No per-class metrics
    return {
        'mean_accuracy': np.mean(scores),
        'std': np.std(scores)
    }

def confusion_matrix(y_true, y_pred, classes):
    # BUG: Manual implementation with an off-by-one error
    n_classes = len(classes)
    matrix = np.zeros((n_classes, n_classes))
    for true, pred in zip(y_true, y_pred):
        # BUG: Doesn't handle unseen classes
        i = list(classes).index(true)
        j = list(classes).index(pred)
        matrix[i][j] += 1
    # BUG: No normalization option
    return matrix`,
    expectedBehavior: 'Stratified k-fold, proper shuffling, include F1/precision/recall, confidence intervals, handle last fold correctly, add confusion matrix normalization.',
    hints: ['Shuffle data before splitting folds or use StratifiedKFold', 'Include the remainder samples in the last fold', 'Add macro/weighted F1 score', 'Compute 95% confidence interval'],
    deliverables: ['Fix fold splitting with stratification', 'Add multiple evaluation metrics', 'Add confidence intervals', 'Fix confusion matrix implementation'],
  },
];
