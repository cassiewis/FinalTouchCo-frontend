export const BUFFER_DAYS = 3;
export const RESERVATION_LENGTH = 5; // Number of days allowed for reservation
export const EMAIL = "finaltouchco.info@gmail.com"; 
export const MINIMUM_ORDER = 50;
export const SEND_INVOICE_DAYS = 45; // Days before the date to send invoice
export const PAYMENT_DUE_DAYS = 30; // Days before the date to send deposit
export const DAILY_LATE_FEE = 30; // Daily late fee in dollars
export const TAX_PERCENTAGE = 0.06; // 6% tax rate
export const BACKEND_URL = "https://finaltouchco-backend.onrender.com"

// filters
export const EVENT_TYPES = ["Wedding", "Baby Shower", "Engagement", "Bridal Shower", "Birthday"];
export const CATEGORIES = ["Signage", "Welcome Sign", "Seating Chart", "Table Numbers", "Tabletop Signage", "Lighting", "Tableware", "Backdrop", "Floral"];
export const MATERIALS = ["Acrylic", "Mirror", "Wood", "Metal", "Fabric", "Glass"];
export const COLORS = ['White', 'Black', 'Gold', 'Silver', 'Clear', 'Brown', 'Blue', 'Green', 'Pink', 'Purple', 'Red', 'Yellow', 'Orange'];
// export const BACKEND_URL = "http://localhost:8080";

// Generic navigation function with cmd+click support and auto-scroll
export const navigateWithScroll = (
  router: any, 
  event: MouseEvent | undefined, 
  path: string, 
  queryParams?: any
): void => {

  console.log("Navigating to:", path, "with queryParams:", queryParams);

  // Handle cmd+click for new tab
  if (event && (event.metaKey || event.ctrlKey)) {
    const url = queryParams 
      ? `${path}?${new URLSearchParams(queryParams).toString()}`
      : path;
    window.open(url, '_blank');
    return;
  }
  
  // Normal navigation with scroll
  const navigationOptions: any = {};
  if (queryParams) {
    navigationOptions.queryParams = queryParams;
  }
  
  router.navigate([path], navigationOptions).then(() => {
    // Scroll to .app-container
    setTimeout(() => {
      const appContainer = document.querySelector('.app-container');
      if (appContainer) {
        appContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo(0, 0);
      }
    }, 100);
  });
};

