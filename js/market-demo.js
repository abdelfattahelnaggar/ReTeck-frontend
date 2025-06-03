/**
 * MARKET VOUCHER ENHANCEMENT DEMO
 * Demonstrates the flexible partial discount functionality
 */

console.log("🛒 === ReTech Market Enhanced Voucher System Demo ===");
console.log("This demo shows how the new flexible discount system works\n");

// Example scenarios to demonstrate the enhanced voucher logic
const demoScenarios = [
  {
    name: "🍎 Small Purchase - Cart Lower Than Voucher",
    cartTotal: 45.5,
    voucherBalance: 100,
    description:
      "User buys organic eggs for E£45.50 with E£100 voucher balance",
  },
  {
    name: "☕ Exact Match - Cart Equals Voucher",
    cartTotal: 150,
    voucherBalance: 150,
    description:
      "User buys premium coffee beans for E£150 with E£150 voucher balance",
  },
  {
    name: "🛍️ Large Purchase - Cart Exceeds Voucher",
    cartTotal: 275.99,
    voucherBalance: 120,
    description:
      "User buys multiple items totaling E£275.99 with E£120 voucher balance",
  },
];

function runVoucherDemo() {
  console.log("🚀 Running Enhanced Voucher System Demo...\n");

  demoScenarios.forEach((scenario, index) => {
    console.log(`${index + 1}. ${scenario.name}`);
    console.log(`   ${scenario.description}`);
    console.log(`   Cart Total: E£${scenario.cartTotal}`);
    console.log(`   Available Vouchers: E£${scenario.voucherBalance}`);

    // Calculate the flexible discount
    const result = calculateVoucherDiscount(
      scenario.cartTotal,
      scenario.voucherBalance
    );

    console.log("   ✅ RESULT:");
    console.log(
      `   • Voucher Discount Applied: E£${result.discountApplied.toFixed(2)}`
    );
    console.log(
      `   • Amount to Pay Separately: E£${result.remainingCartAmount.toFixed(
        2
      )}`
    );
    console.log(
      `   • Remaining Voucher Balance: E£${result.remainingVoucherBalance.toFixed(
        2
      )}`
    );
    console.log(
      `   • Can Proceed to Purchase: ${
        result.canProceedToPurchase ? "YES ✅" : "NO ❌"
      }`
    );

    // Show before/after comparison
    console.log("   📊 COMPARISON:");
    console.log(`   • Before: User had E£${scenario.voucherBalance} vouchers`);
    console.log(
      `   • After:  User has E£${result.remainingVoucherBalance.toFixed(
        2
      )} vouchers`
    );

    if (result.remainingCartAmount > 0) {
      console.log(
        `   💳 USER PAYS: E£${result.remainingCartAmount.toFixed(
          2
        )} separately at store`
      );
    } else {
      console.log(`   🎉 FULLY COVERED: No additional payment needed!`);
    }

    console.log("");
  });

  console.log("✨ === Key Benefits of Enhanced System ===");
  console.log("• ✅ Users are NEVER blocked from purchasing");
  console.log("• ✅ Vouchers provide maximum possible discount");
  console.log("• ✅ Remaining voucher balance is preserved");
  console.log("• ✅ Users can pay any remaining amount separately");
  console.log("• ✅ Better user experience and flexibility");
  console.log("");

  console.log("🧪 === Test the System ===");
  console.log("Open the browser console and run:");
  console.log("• testVoucherDiscountScenarios() - Run automated tests");
  console.log("• addTestVouchers([100, 150, 200]) - Add test vouchers");
  console.log("• Add items to cart and see the flexible discount in action!");
}

// Auto-run demo when script loads
if (typeof calculateVoucherDiscount === "function") {
  runVoucherDemo();
} else {
  console.log("⏳ Waiting for market.js to load...");
  setTimeout(() => {
    if (typeof calculateVoucherDiscount === "function") {
      runVoucherDemo();
    } else {
      console.log(
        "❌ market.js not loaded. Please run this demo after the market page loads."
      );
    }
  }, 1000);
}

// Export for manual testing
window.runVoucherDemo = runVoucherDemo;
