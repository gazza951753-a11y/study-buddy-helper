import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  GraduationCap, 
  User, 
  Settings, 
  Package, 
  Bell, 
  Gift, 
  Link2, 
  LogOut,
  Edit2,
  Save,
  X
} from "lucide-react";
import { toast } from "sonner";
import { User as SupabaseUser } from "@supabase/supabase-js";

interface Profile {
  id: string;
  user_id: string;
  username: string;
  email: string;
  phone: string | null;
  telegram_username: string | null;
  created_at: string;
  updated_at: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  
  const [editData, setEditData] = useState({
    username: "",
    phone: "",
    telegram_username: "",
  });

  useEffect(() => {
    const safetyTimer = window.setTimeout(() => {
      setLoading(false);
    }, 2500);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);

        if (session?.user) {
          setLoading(false);
          fetchProfile(session.user.id);
          return;
        }

        setLoading(false);
        navigate("/auth");
      }
    );

    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        if (session?.user) {
          setUser(session.user);
          setLoading(false);
          fetchProfile(session.user.id);
          return;
        }

        setLoading(false);
        navigate("/auth");
      })
      .catch((error) => {
        console.error("Error getting session:", error);
        setLoading(false);
      });

    return () => {
      window.clearTimeout(safetyTimer);
      subscription.unsubscribe();
    };
  }, [navigate]);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setProfile(data);
        setEditData({
          username: data.username,
          phone: data.phone || "",
          telegram_username: data.telegram_username || "",
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Вы вышли из системы");
    navigate("/");
  };

  const handleSaveProfile = async () => {
    if (!profile) return;

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          username: editData.username,
          phone: editData.phone || null,
          telegram_username: editData.telegram_username || null,
        })
        .eq("id", profile.id);

      if (error) throw error;

      setProfile({
        ...profile,
        username: editData.username,
        phone: editData.phone || null,
        telegram_username: editData.telegram_username || null,
      });
      setEditing(false);
      toast.success("Профиль обновлён");
    } catch (error) {
      toast.error("Ошибка при сохранении");
    }
  };

  const menuItems = [
    { id: "profile", label: "Профиль", icon: User },
    { id: "orders", label: "Мои заказы", icon: Package },
    { id: "notifications", label: "Уведомления", icon: Bell },
    { id: "bonuses", label: "Скидки и бонусы", icon: Gift },
    { id: "referral", label: "Реферальная ссылка", icon: Link2 },
    { id: "settings", label: "Настройки", icon: Settings },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <a href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">
                Edu<span className="text-primary">Help</span>
              </span>
            </a>
            
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground hidden md:block">
                {profile?.email || user?.email}
              </span>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Выйти
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-64 flex-shrink-0">
            <nav className="bg-card rounded-xl border border-border p-2 sticky top-24">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
                    activeTab === item.id
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </button>
              ))}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <div className="bg-card rounded-xl border border-border p-6 lg:p-8">
              {activeTab === "profile" && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-foreground">Мой профиль</h1>
                    {!editing ? (
                      <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                        <Edit2 className="w-4 h-4 mr-2" />
                        Редактировать
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setEditing(false)}>
                          <X className="w-4 h-4 mr-2" />
                          Отмена
                        </Button>
                        <Button size="sm" onClick={handleSaveProfile}>
                          <Save className="w-4 h-4 mr-2" />
                          Сохранить
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-10 h-10 text-primary" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold">{profile?.username || user?.user_metadata?.username || user?.email?.split("@")[0] || "Пользователь"}</h2>
                        <p className="text-muted-foreground">{profile?.email || user?.email}</p>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label>Логин</Label>
                        {editing ? (
                          <Input
                            value={editData.username}
                            onChange={(e) => setEditData({ ...editData, username: e.target.value })}
                          />
                        ) : (
                          <p className="mt-1 text-foreground">{profile?.username || user?.user_metadata?.username || user?.email?.split("@")[0] || "-"}</p>
                        )}
                      </div>

                      <div>
                        <Label>Email</Label>
                        <p className="mt-1 text-foreground">{profile?.email || user?.email}</p>
                      </div>

                      <div>
                        <Label>Телефон</Label>
                        {editing ? (
                          <Input
                            value={editData.phone}
                            onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                            placeholder="Не указан"
                          />
                        ) : (
                          <p className="mt-1 text-foreground">
                            {profile?.phone || <span className="text-muted-foreground">Не указан</span>}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label>Telegram</Label>
                        {editing ? (
                          <Input
                            value={editData.telegram_username}
                            onChange={(e) => setEditData({ ...editData, telegram_username: e.target.value })}
                            placeholder="Не указан"
                          />
                        ) : (
                          <p className="mt-1 text-foreground">
                            {profile?.telegram_username || <span className="text-muted-foreground">Не указан</span>}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-border">
                      <p className="text-sm text-muted-foreground">
                        Дата регистрации: {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('ru-RU') : '-'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "orders" && (
                <div>
                  <h1 className="text-2xl font-bold text-foreground mb-6">Мои заказы</h1>
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">У вас пока нет заказов</p>
                    <Button variant="hero" className="mt-4" onClick={() => navigate("/#contacts")}>
                      Оформить первый заказ
                    </Button>
                  </div>
                </div>
              )}

              {activeTab === "notifications" && (
                <div>
                  <h1 className="text-2xl font-bold text-foreground mb-6">Уведомления</h1>
                  <div className="text-center py-12">
                    <Bell className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">Нет новых уведомлений</p>
                  </div>
                </div>
              )}

              {activeTab === "bonuses" && (
                <div>
                  <h1 className="text-2xl font-bold text-foreground mb-6">Скидки и бонусы</h1>
                  <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-6 mb-6">
                    <div className="flex items-center gap-4">
                      <Gift className="w-12 h-12 text-primary" />
                      <div>
                        <p className="text-3xl font-bold text-foreground">0 ₽</p>
                        <p className="text-muted-foreground">Накопленные бонусы</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-muted-foreground">
                    Бонусы начисляются за каждый оплаченный заказ и могут быть использованы 
                    для оплаты до 30% стоимости следующих заказов.
                  </p>
                </div>
              )}

              {activeTab === "referral" && (
                <div>
                  <h1 className="text-2xl font-bold text-foreground mb-6">Реферальная программа</h1>
                  <div className="bg-secondary rounded-xl p-6 mb-6">
                    <Label>Ваша реферальная ссылка</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        readOnly
                        value={`${window.location.origin}/?ref=${user?.id?.slice(0, 8)}`}
                        className="bg-background"
                      />
                      <Button
                        variant="outline"
                        onClick={() => {
                          navigator.clipboard.writeText(`${window.location.origin}/?ref=${user?.id?.slice(0, 8)}`);
                          toast.success("Ссылка скопирована!");
                        }}
                      >
                        Копировать
                      </Button>
                    </div>
                  </div>
                  <p className="text-muted-foreground">
                    Приглашайте друзей и получайте 10% от суммы их первого заказа на свой бонусный счёт!
                  </p>
                </div>
              )}

              {activeTab === "settings" && (
                <div>
                  <h1 className="text-2xl font-bold text-foreground mb-6">Настройки</h1>
                  <div className="space-y-6">
                    <div className="p-4 border border-border rounded-lg">
                      <h3 className="font-medium mb-2">Сменить пароль</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Для смены пароля мы отправим вам ссылку на email
                      </p>
                      <Button variant="outline" onClick={async () => {
                        if (profile?.email) {
                          await supabase.auth.resetPasswordForEmail(profile.email, {
                            redirectTo: `${window.location.origin}/auth`,
                          });
                          toast.success("Ссылка для сброса пароля отправлена на email");
                        }
                      }}>
                        Отправить ссылку
                      </Button>
                    </div>

                    <div className="p-4 border border-destructive/50 rounded-lg">
                      <h3 className="font-medium text-destructive mb-2">Удалить аккаунт</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Это действие нельзя отменить. Все ваши данные будут удалены.
                      </p>
                      <Button variant="destructive" disabled>
                        Удалить аккаунт
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
