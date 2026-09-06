import React, { useState, useEffect } from "react";
import { useTenant } from "@/contexts/TenantContext";
import { loyaltyApi } from "@/lib/api/loyalty";
import { customersApi } from "@/lib/api/customers";
import { LoyaltyReward, LoyaltyTransaction, Customer } from "@/lib/types";
import { formatKES, formatDateTime } from "@/lib/utils";
import { StatusBadge } from "@/components/business/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Award, Gift, Plus, Sparkles, Users, ArrowUpRight } from "lucide-react";

export default function LoyaltyPage() {
  const { currentTenant } = useTenant();
  const [rewards, setRewards] = useState<LoyaltyReward[]>([]);
  const [transactions, setTransactions] = useState<LoyaltyTransaction[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Add Reward Modal
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newReward, setNewReward] = useState({
    title: "",
    pointsRequired: 500,
    discountAmount: 500,
    description: "",
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [rData, tData, cData] = await Promise.all([
        loyaltyApi.getRewards(currentTenant.id),
        loyaltyApi.getTransactions(currentTenant.id),
        customersApi.getCustomers(currentTenant.id),
      ]);
      setRewards(rData);
      setTransactions(tData);
      setCustomers(cData);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentTenant.id]);

  const handleCreateReward = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReward.title || newReward.pointsRequired <= 0) return;
    setIsSubmitting(true);

    try {
      await loyaltyApi.createReward({
        tenantId: currentTenant.id,
        title: newReward.title,
        pointsRequired: Number(newReward.pointsRequired),
        discountAmount: Number(newReward.discountAmount),
        description: newReward.description,
        isActive: true,
      });

      setIsAddOpen(false);
      setNewReward({
        title: "",
        pointsRequired: 500,
        discountAmount: 500,
        description: "",
      });
      loadData();
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalPointsInCirculation = customers.reduce((sum, c) => sum + c.loyaltyPoints, 0);
  const platinumMembers = customers.filter((c) => c.loyaltyTier === "Platinum").length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Customer Loyalty & Rewards</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Reward repeat shoppers, configure redemption vouchers, and manage VIP customer tiers.
          </p>
        </div>

        <Button
          onClick={() => setIsAddOpen(true)}
          size="sm"
          className="gap-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          <span>Create Reward Voucher</span>
        </Button>
      </div>

      {/* 3 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Points Issued</p>
          <span className="text-2xl font-black text-purple-600 font-mono">{totalPointsInCirculation.toLocaleString()} pts</span>
          <p className="text-[10px] text-slate-400">Rate: 1 Pt per KES 100 spent</p>
        </Card>

        <Card className="p-4 space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Active Reward Vouchers</p>
          <span className="text-2xl font-black text-slate-900 font-mono">{rewards.length} rewards</span>
          <p className="text-[10px] text-slate-400">Available in POS</p>
        </Card>

        <Card className="p-4 space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Platinum VIP Shoppers</p>
          <span className="text-2xl font-black text-emerald-600 font-mono">{platinumMembers} VIPs</span>
          <p className="text-[10px] text-slate-400">High retention rate</p>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="rewards" className="space-y-4">
        <TabsList>
          <TabsTrigger value="rewards">Rewards Catalog ({rewards.length})</TabsTrigger>
          <TabsTrigger value="history">Points Ledger ({transactions.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="rewards">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {rewards.map((rew) => (
              <Card key={rew.id} className="p-5 flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-600 flex items-center gap-1">
                      <Gift className="h-4 w-4" />
                      <span>{rew.pointsRequired} Points</span>
                    </span>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      Discount: {formatKES(rew.discountAmount)}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">{rew.title}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">{rew.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="history">
          <Card className="shadow-xs">
            <CardContent className="p-0">
              {transactions.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">No loyalty point transactions recorded yet.</div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                    <tr>
                      <th className="p-3.5">Customer</th>
                      <th className="p-3.5">Type</th>
                      <th className="p-3.5 text-right">Points</th>
                      <th className="p-3.5">Description</th>
                      <th className="p-3.5">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {transactions.map((tx) => (
                      <tr key={tx.id}>
                        <td className="p-3.5 font-semibold text-slate-900">{tx.customerName}</td>
                        <td className="p-3.5">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                              tx.type === "earned"
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-purple-50 text-purple-700"
                            }`}
                          >
                            {tx.type}
                          </span>
                        </td>
                        <td className="p-3.5 text-right font-mono font-bold">
                          <span className={tx.type === "earned" ? "text-emerald-600" : "text-purple-600"}>
                            {tx.type === "earned" ? `+${tx.points}` : `-${tx.points}`} pts
                          </span>
                        </td>
                        <td className="p-3.5 text-slate-600">{tx.description}</td>
                        <td className="p-3.5 text-slate-400">{formatDateTime(tx.date)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Reward Modal */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Add Reward Voucher</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateReward} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Voucher Title</label>
              <Input
                placeholder="e.g. KES 1,000 Shopping Voucher"
                value={newReward.title}
                onChange={(e) => setNewReward({ ...newReward, title: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Points Required</label>
                <Input
                  type="number"
                  min="50"
                  value={newReward.pointsRequired || ""}
                  onChange={(e) => setNewReward({ ...newReward, pointsRequired: Number(e.target.value) })}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Discount Value (KES)</label>
                <Input
                  type="number"
                  min="50"
                  value={newReward.discountAmount || ""}
                  onChange={(e) => setNewReward({ ...newReward, discountAmount: Number(e.target.value) })}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Description / Terms</label>
              <Input
                placeholder="e.g. Applicable on orders above KES 5,000"
                value={newReward.description}
                onChange={(e) => setNewReward({ ...newReward, description: e.target.value })}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" isLoading={isSubmitting}>
                Save Reward
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
