export const TASKS = [
  {
    id: 'task-1',
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
];
