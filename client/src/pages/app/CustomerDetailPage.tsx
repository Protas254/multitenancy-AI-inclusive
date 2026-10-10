import React, { useState, useEffect } from "react";
import { useParams } from "@/lib/navigation";
import Link from "@/components/ui/link";
import { useTenant } from "@/contexts/TenantContext";
import { customersApi } from "@/lib/api/customers";
import { salesApi } from "@/lib/api/sales";
import { creditApi } from "@/lib/api/credit";
import { loyaltyApi } from "@/lib/api/loyalty";
import { Customer, Sale, CreditAccount, LoyaltyReward } from "@/lib/types";
import { formatKES, formatDate, formatDateTime } from "@/lib/utils";
import { StatusBadge } from "@/components/business/StatusBadge";
import { PaymentModal } from "@/components/business/PaymentModal";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ArrowLeft, User, Award, CreditCard, ShoppingCart, DollarSign, Gift, Phone, Mail, MapPin } from "lucide-react";

export default function CustomerDetailPage() {
  const params = useParams();
  const { currentTenant } = useTenant();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [sales, setSales] = useState<Sale[]>([]);
  const [creditAccounts, setCreditAccounts] = useState<CreditAccount[]>([]);
  const [rewards, setRewards] = useState<LoyaltyReward[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  const customerId = params.id as string;

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [cust, allSales, allCredits, allRewards] = await Promise.all([
        customersApi.getCustomerById(customerId),
        salesApi.getSales(currentTenant.id),
        creditApi.getAccounts(currentTenant.id),
        loyaltyApi.getRewards(currentTenant.id),
      ]);
      setCustomer(cust);
      if (cust) {
        setSales(allSales.filter((s) => s.customerId === cust.id || s.customerName === cust.name));
        setCreditAccounts(allCredits.filter((c) => c.entityId === cust.id || c.entityName === cust.name));
        setRewards(allRewards);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (customerId) loadData();
  }, [customerId, currentTenant.id]);

  const handleRecordPayment = async (data: any) => {
    if (creditAccounts.length > 0) {
      await creditApi.recordPayment({
        creditAccountId: creditAccounts[0].id,
        amount: data.amount,
        paymentMethod: data.paymentMethod,
        referenceCode: data.referenceCode,
        recordedBy: "John Kamau",
        notes: data.notes,
      });
      loadData();
    }
  };

  const handleRedeemReward = async (rewardId: string) => {
    if (!customer) return;
    try {
      await loyaltyApi.redeemReward(customer.id, rewardId);
      alert("Loyalty reward successfully redeemed!");
      loadData();
    } catch (err: any) {
      alert(err.message || "Failed to redeem reward.");
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-xs text-slate-500">Loading customer profile...</div>;
  }

  if (!customer) {
    return (
      <div className="p-8 text-center space-y-3">
        <p className="text-sm font-semibold text-slate-700">Customer not found.</p>
        <Link href="/customers">
          <Button variant="outline" size="sm">Back to Customers</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/customers">
            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900">{customer.name}</h1>
              <StatusBadge status={customer.loyaltyTier} />
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
              <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {customer.phone}</span>
              {customer.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {customer.email}</span>}
              {customer.address && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {customer.address}</span>}
            </div>
          </div>
        </div>

        {customer.outstandingCredit > 0 && (
          <Button
            onClick={() => setIsPaymentOpen(true)}
            size="sm"
            className="gap-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700"
          >
            <DollarSign className="h-4 w-4" />
            <span>Record Debt Payment</span>
          </Button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Lifetime Spend</p>
          <span className="text-2xl font-black text-slate-900 font-mono">{formatKES(customer.totalPurchases)}</span>
          <p className="text-[10px] text-slate-400">{customer.orderCount} total orders</p>
        </Card>

        <Card className="p-4 space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Loyalty Points</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-purple-600 font-mono">{customer.loyaltyPoints}</span>
            <span className="text-xs text-slate-500">pts ({customer.loyaltyTier})</span>
          </div>
        </Card>

        <Card className="p-4 space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Outstanding Debt</p>
          <span
            className={`text-2xl font-black font-mono ${
              customer.outstandingCredit > 0 ? "text-rose-600" : "text-emerald-600"
            }`}
          >
            {formatKES(customer.outstandingCredit)}
          </span>
          <p className="text-[10px] text-slate-400">Credit Limit: {formatKES(customer.creditLimit)}</p>
        </Card>

        <Card className="p-4 space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Customer Status</p>
          <div className="pt-1">
            <StatusBadge status={customer.status} />
          </div>
          <p className="text-[10px] text-slate-400">Member since {formatDate(customer.createdAt)}</p>
        </Card>
      </div>

      {/* Tabs: Purchases, Credit Accounts, Loyalty Rewards */}
      <Tabs defaultValue="purchases" className="space-y-4">
        <TabsList>
          <TabsTrigger value="purchases">Purchase History ({sales.length})</TabsTrigger>
          <TabsTrigger value="credit">Debt and Credit Ledger ({creditAccounts.length})</TabsTrigger>
          <TabsTrigger value="loyalty">Loyalty Rewards ({rewards.length})</TabsTrigger>
        </TabsList>

        {/* Purchases Tab */}
        <TabsContent value="purchases">
          <Card className="shadow-xs">
            <CardContent className="p-0">
              {sales.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">No purchases recorded yet.</div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                    <tr>
                      <th className="p-3.5">Sale #</th>
                      <th className="p-3.5">Items</th>
                      <th className="p-3.5 text-right">Total Amount</th>
                      <th className="p-3.5">Payment</th>
                      <th className="p-3.5">Date</th>
                      <th className="p-3.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {sales.map((sale) => (
                      <tr key={sale.id}>
                        <td className="p-3.5 font-bold font-mono text-slate-900">{sale.saleNumber}</td>
                        <td className="p-3.5 text-slate-600">
                          {sale.items.map((i) => `${i.productName} (x${i.quantity})`).join(", ")}
                        </td>
                        <td className="p-3.5 text-right font-bold font-mono text-slate-900">
                          {formatKES(sale.totalAmount)}
                        </td>
                        <td className="p-3.5 uppercase font-semibold text-slate-700">{sale.paymentMethod}</td>
                        <td className="p-3.5 text-slate-500">{formatDateTime(sale.date)}</td>
                        <td className="p-3.5 text-right">
                          <Link href={`/sales/${sale.id}`}>
                            <Button variant="outline" size="sm" className="h-7 text-xs">
                              Details
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Credit Ledger Tab */}
        <TabsContent value="credit">
          <Card className="shadow-xs">
            <CardContent className="p-0">
              {creditAccounts.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">No outstanding or historical credit accounts.</div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                    <tr>
                      <th className="p-3.5">Reference Doc</th>
                      <th className="p-3.5">Total Debt</th>
                      <th className="p-3.5">Paid</th>
                      <th className="p-3.5">Balance Due</th>
                      <th className="p-3.5">Due Date</th>
                      <th className="p-3.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {creditAccounts.map((acc) => (
                      <tr key={acc.id}>
                        <td className="p-3.5 font-bold font-mono text-slate-900">{acc.referenceDocId}</td>
                        <td className="p-3.5 font-mono">{formatKES(acc.totalAmount)}</td>
                        <td className="p-3.5 font-mono text-emerald-600">{formatKES(acc.paidAmount)}</td>
                        <td className="p-3.5 font-mono font-bold text-rose-600">{formatKES(acc.balanceDue)}</td>
                        <td className="p-3.5 text-slate-500">{formatDate(acc.dueDate)}</td>
                        <td className="p-3.5">
                          <StatusBadge status={acc.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Loyalty Tab */}
        <TabsContent value="loyalty">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {rewards.map((rew) => {
              const canRedeem = customer.loyaltyPoints >= rew.pointsRequired;

              return (
                <Card key={rew.id} className="p-5 flex flex-col justify-between space-y-3">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-purple-600 flex items-center gap-1">
                        <Gift className="h-3.5 w-3.5" />
                        <span>{rew.pointsRequired} Points</span>
                      </span>
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        Save {formatKES(rew.discountAmount)}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">{rew.title}</h4>
                    <p className="text-xs text-slate-500">{rew.description}</p>
                  </div>

                  <Button
                    size="sm"
                    disabled={!canRedeem}
                    onClick={() => handleRedeemReward(rew.id)}
                    className={`w-full text-xs font-bold ${
                      canRedeem ? "bg-purple-600 hover:bg-purple-700" : ""
                    }`}
                  >
                    {canRedeem ? "Redeem Voucher" : `Need ${rew.pointsRequired - customer.loyaltyPoints} more pts`}
                  </Button>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        recipientName={customer.name}
        totalBalance={customer.outstandingCredit}
        onRecord={handleRecordPayment}
      />
    </div>
  );
}
