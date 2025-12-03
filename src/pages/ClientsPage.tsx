import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Building2, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  ArrowLeft,
  Wallet,
  PiggyBank,
  Receipt,
  Trash2,
  Calendar,
  Pencil
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { ClientCard } from '@/components/clients/ClientCard';
import { CreateClientModal } from '@/components/clients/CreateClientModal';
import { EditClientModal } from '@/components/clients/EditClientModal';
import { ClientDetailModal } from '@/components/clients/ClientDetailModal';
import { AddTransactionModal } from '@/components/clients/AddTransactionModal';
import { EditTransactionModal } from '@/components/clients/EditTransactionModal';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { StatsCard } from '@/components/common/StatsCard';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useClients } from '@/hooks/useClients';
import { useGems } from '@/hooks/useGems';
import { Client, Transaction } from '@/types';

const ClientsPage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    clients, 
    transactions, 
    categories,
    loading, 
    createClient, 
    deleteClient,
    addDigitalMarketingCost,
    updateClient,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    getFinancialSummary 
  } = useClients();
  const { gems } = useGems();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [editClient, setEditClient] = useState<Client | null>(null);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);
  const [editTransaction, setEditTransaction] = useState<Transaction | null>(null);

  const filteredClients = clients.filter(client =>
    client.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.phone.includes(searchQuery) ||
    (client.customProjectType && client.customProjectType.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const financialSummary = getFinancialSummary();

  const handleCreateClient = async (data: any) => {
    await createClient(data);
  };

  const handleEditClient = async (id: string, data: Partial<Client>) => {
    await updateClient(id, data);
    setEditClient(null);
  };

  const handleDeleteClient = async () => {
    if (clientToDelete) {
      await deleteClient(clientToDelete.id);
      setClientToDelete(null);
    }
  };

  const handleAddDigitalMarketingCost = async (clientId: string, cost: any) => {
    await addDigitalMarketingCost(clientId, cost);
  };

  const handleUpdateTravellingCharges = async (clientId: string, amount: number) => {
    const client = clients.find(c => c.id === clientId);
    if (client) {
      await updateClient(clientId, {
        companySplit: {
          ...client.companySplit,
          travellingCharges: amount,
        },
      });
    }
  };

  const handleCreateTransaction = async (data: any) => {
    await createTransaction(data);
  };

  const handleEditTransaction = async (id: string, data: { type: string; category: string; amount: number; description: string }) => {
    await updateTransaction(id, data);
    setEditTransaction(null);
  };

  const handleDeleteTransaction = async () => {
    if (transactionToDelete) {
      await deleteTransaction(transactionToDelete.id);
      setTransactionToDelete(null);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading clients..." />;
  }

  return (
    <Layout>
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 sm:mb-6"
      >
        <Button variant="ghost" onClick={() => navigate('/admin')} className="-ml-2 mb-3 sm:mb-4 text-sm sm:text-base">
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
          Back to Dashboard
        </Button>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1 sm:mb-2">Clients & Finance</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Manage your clients and track revenue</p>
      </motion.div>

      {/* Financial Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <StatsCard
          title="Total Revenue"
          value={`₹${financialSummary.totalRevenue.toLocaleString()}`}
          icon={Wallet}
          variant="primary"
          index={0}
        />
        <StatsCard
          title="Project Costs"
          value={`₹${financialSummary.totalProjectCosts.toLocaleString()}`}
          icon={Receipt}
          variant="warning"
          index={1}
        />
        <StatsCard
          title="Other Income"
          value={`₹${financialSummary.totalOtherIncome.toLocaleString()}`}
          icon={TrendingUp}
          variant="success"
          index={2}
        />
        <StatsCard
          title="Net Profit"
          value={`₹${financialSummary.netProfit.toLocaleString()}`}
          icon={PiggyBank}
          variant={financialSummary.netProfit >= 0 ? 'success' : 'destructive'}
          index={3}
        />
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="clients" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:inline-grid">
          <TabsTrigger value="clients" className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Clients
          </TabsTrigger>
          <TabsTrigger value="finance" className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Income/Expenses
          </TabsTrigger>
        </TabsList>

        {/* Clients Tab */}
        <TabsContent value="clients" className="space-y-6">
          {/* Actions Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search clients by name, project, or phone..."
                className="pl-11"
              />
            </div>
            <Button variant="gradient" onClick={() => setShowCreateModal(true)}>
              <Plus className="w-5 h-5 mr-2" />
              Add Client
            </Button>
          </motion.div>

          {/* Clients Grid */}
          {filteredClients.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredClients.map((client, index) => (
                <ClientCard
                  key={client.id}
                  client={client}
                  gems={gems}
                  onOpen={setSelectedClient}
                  onEdit={setEditClient}
                  onDelete={setClientToDelete}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div className="w-20 h-20 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {searchQuery ? 'No clients found' : 'No clients yet'}
              </h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery ? 'Try a different search term' : 'Add your first client to get started'}
              </p>
              {!searchQuery && (
                <Button variant="gradient" onClick={() => setShowCreateModal(true)}>
                  <Plus className="w-5 h-5 mr-2" />
                  Add First Client
                </Button>
              )}
            </motion.div>
          )}
        </TabsContent>

        {/* Finance Tab */}
        <TabsContent value="finance" className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Financial Summary Card */}
            <Card variant="elevated" className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PiggyBank className="w-5 h-5" />
                  Financial Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Total Project Costs</span>
                    <span className="font-medium">₹{financialSummary.totalProjectCosts.toLocaleString()}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Work Split (50%)</span>
                    <span className="font-medium text-blue-500">₹{financialSummary.totalWorkSplit.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Company Split (50%)</span>
                    <span className="font-medium text-purple-500">₹{financialSummary.totalCompanySplit.toLocaleString()}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center text-destructive">
                    <span>Digital Marketing Costs</span>
                    <span className="font-medium">-₹{financialSummary.totalDigitalMarketingCosts.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-destructive">
                    <span>Travelling Charges</span>
                    <span className="font-medium">-₹{financialSummary.totalTravellingCharges.toLocaleString()}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center text-success">
                    <span>Other Income</span>
                    <span className="font-medium">+₹{financialSummary.totalOtherIncome.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-destructive">
                    <span>Other Expenses</span>
                    <span className="font-medium">-₹{financialSummary.totalOtherExpenses.toLocaleString()}</span>
                  </div>
                  <Separator />
                  <div className={`flex justify-between items-center text-lg font-bold ${
                    financialSummary.netProfit >= 0 ? 'text-success' : 'text-destructive'
                  }`}>
                    <span>Net Profit</span>
                    <span>₹{financialSummary.netProfit.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Transactions List */}
            <Card variant="elevated" className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="w-5 h-5" />
                  Transactions
                </CardTitle>
                <Button variant="gradient" size="sm" onClick={() => setShowTransactionModal(true)}>
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {transactions.length > 0 ? (
                    transactions.map((transaction) => (
                      <motion.div
                        key={transaction.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-start sm:items-center justify-between p-3 rounded-lg bg-secondary/30 group gap-2"
                      >
                        <div className="flex items-start sm:items-center gap-2 sm:gap-3 min-w-0 flex-1">
                          <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            transaction.type === 'income' ? 'bg-success/20' : 'bg-destructive/20'
                          }`}>
                            {transaction.type === 'income' ? (
                              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-success" />
                            ) : (
                              <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5 text-destructive" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                              <span className="font-medium text-foreground text-sm sm:text-base truncate">{transaction.category}</span>
                              <Badge variant="outline" className="text-xs">
                                {transaction.type}
                              </Badge>
                            </div>
                            {transaction.description && (
                              <p className="text-xs sm:text-sm text-muted-foreground truncate">{transaction.description}</p>
                            )}
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Calendar className="w-3 h-3" />
                              <span className="truncate">{transaction.createdAt.toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2">
                          <span className={`font-bold text-sm sm:text-base ${
                            transaction.type === 'income' ? 'text-success' : 'text-destructive'
                          }`}>
                            {transaction.type === 'income' ? '+' : '-'}₹{transaction.amount.toLocaleString()}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-primary"
                            onClick={() => setEditTransaction(transaction)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                            onClick={() => setTransactionToDelete(transaction)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-10">
                      <Receipt className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground">No transactions yet</p>
                      <Button variant="outline" size="sm" className="mt-3" onClick={() => setShowTransactionModal(true)}>
                        <Plus className="w-4 h-4 mr-1" />
                        Add Transaction
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <CreateClientModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateClient}
        gems={gems}
      />

      <EditClientModal
        client={editClient}
        isOpen={!!editClient}
        onClose={() => setEditClient(null)}
        onSubmit={handleEditClient}
        gems={gems}
      />

      <ClientDetailModal
        client={selectedClient}
        isOpen={!!selectedClient}
        onClose={() => setSelectedClient(null)}
        onAddDigitalMarketingCost={handleAddDigitalMarketingCost}
        onUpdateTravellingCharges={handleUpdateTravellingCharges}
        gems={gems}
      />

      <AddTransactionModal
        isOpen={showTransactionModal}
        onClose={() => setShowTransactionModal(false)}
        onSubmit={handleCreateTransaction}
        categories={categories}
      />

      <EditTransactionModal
        transaction={editTransaction}
        isOpen={!!editTransaction}
        onClose={() => setEditTransaction(null)}
        onSubmit={handleEditTransaction}
        categories={categories}
      />

      <ConfirmDialog
        isOpen={!!clientToDelete}
        onClose={() => setClientToDelete(null)}
        onConfirm={handleDeleteClient}
        title="Delete Client"
        message={`Are you sure you want to delete ${clientToDelete?.businessName}? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />

      <ConfirmDialog
        isOpen={!!transactionToDelete}
        onClose={() => setTransactionToDelete(null)}
        onConfirm={handleDeleteTransaction}
        title="Delete Transaction"
        message={`Are you sure you want to delete this ${transactionToDelete?.type} of ₹${transactionToDelete?.amount}?`}
        confirmText="Delete"
        variant="danger"
      />
    </Layout>
  );
};

export default ClientsPage;
