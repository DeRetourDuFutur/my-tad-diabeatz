'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import type { UserProfile } from '@/lib/types';
import { calculateBMI } from '@/lib/utils'; // Supposons que cette fonction existe

export default function ProfilePage() {
  const { currentUser, userProfile, loading, updateUserProfile } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [formData, setFormData] = useState<Partial<UserProfile>>({});
  const [isEditing, setIsEditing] = useState(true); // Mode édition par défaut
  const [currentBmi, setCurrentBmi] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (!loading && !currentUser) {
      router.push('/auth');
    }
    if (userProfile) {
      setFormData({
        firstName: userProfile.firstName || '',
        lastName: userProfile.lastName || '',
        // email: userProfile.email, // L'email n'est pas modifiable
        photoURL: userProfile.photoURL || '',
        age: userProfile.age || undefined,
        height: userProfile.height || undefined,
        weight: userProfile.weight || undefined,
        bio: userProfile.bio || '',
        phoneNumber: userProfile.phoneNumber || '',
        allergies: userProfile.allergies || '',
        pathologies: userProfile.pathologies || '',
        // role: userProfile.role, // Le rôle n'est pas modifiable par l'utilisateur
      });
      if (userProfile.height && userProfile.weight) {
        setCurrentBmi(calculateBMI(userProfile.height, userProfile.weight));
      }
    }
  }, [currentUser, userProfile, loading, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNumericChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value === '' ? undefined : Number(value) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) return;

    const updatedData: Partial<UserProfile> = { ...formData };
    if (formData.height && formData.weight) {
      updatedData.bmi = calculateBMI(formData.height, formData.weight);
      setCurrentBmi(updatedData.bmi);
    }

    try {
      await updateUserProfile(updatedData);
      toast({
        title: 'Profil mis à jour',
        description: 'Vos informations ont été enregistrées avec succès.',
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la mise à jour de votre profil.',
        variant: 'destructive',
      });
    }
  };

  if (loading || !currentUser || !userProfile) {
    return <div className="container mx-auto px-6 py-12 text-center">Chargement du profil...</div>;
  }

  return (
    <div className="container mx-auto px-6 py-12 pt-24">
      <Card className="w-full max-w-2xl mx-auto bg-gradient-to-br from-blue-950 to-black shadow-[0_0_15px_0_rgba(0,255,255,0.7),0_0_5px_0_rgba(0,255,255,0.5)] rounded-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Mon Profil</CardTitle>
          <CardDescription>
            Gérez les informations de votre compte.
            {userProfile.role === "Admin" && (
              <span className="ml-2 px-2 py-0.5 bg-cyan-500/20 text-cyan-400 text-xs rounded-full">
                Administrateur
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form id="profile-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName" className="mb-1 block">
                  Prénom
                </Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName || ""}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="bg-gray-200 text-black"
                />
              </div>
              <div>
                <Label htmlFor="lastName" className="mb-1 block">
                  Nom
                </Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName || ""}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="bg-gray-200 text-black"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email" className="mb-1 block">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={userProfile.email || ""}
                disabled
                className="bg-gray-200 text-black"
              />
              <p className="text-xs text-muted-foreground mt-1">
                L'adresse e-mail n'est pas modifiable.
              </p>
            </div>

            {/* TODO: Implémenter la modification du mot de passe et de l'avatar plus tard */}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="age" className="mb-1 block">
                  Âge
                </Label>
                <Input
                  id="age"
                  name="age"
                  type="number"
                  value={formData.age || ""}
                  onChange={handleNumericChange}
                  disabled={!isEditing}
                  className="bg-gray-200 text-black"
                />
              </div>
              <div>
                <Label htmlFor="height" className="mb-1 block">
                  Taille (cm)
                </Label>
                <Input
                  id="height"
                  name="height"
                  type="number"
                  value={formData.height || ""}
                  onChange={handleNumericChange}
                  disabled={!isEditing}
                  className="bg-gray-200 text-black"
                />
              </div>
              <div>
                <Label htmlFor="weight" className="mb-1 block">
                  Poids (kg)
                </Label>
                <Input
                  id="weight"
                  name="weight"
                  type="number"
                  value={formData.weight || ""}
                  onChange={handleNumericChange}
                  disabled={!isEditing}
                  className="bg-gray-200 text-black"
                />
              </div>
            </div>

            {currentBmi !== undefined && (
              <div>
                <Label className="mb-1 block">
                  IMC (Indice de Masse Corporelle)
                </Label>
                <Input
                  value={currentBmi.toFixed(2)}
                  disabled
                  className="font-semibold bg-gray-200 text-black"
                />
              </div>
            )}

            {/* <div>
                <Label htmlFor="bio" className="mb-1 block">Mini-bio</Label>
                <Textarea id="bio" name="bio" value={formData.bio || ''} onChange={handleChange} disabled={!isEditing} rows={1} className="bg-gray-200 text-black" />
              </div> */}

            <div>
              <Label htmlFor="phoneNumber" className="mb-1 block">
                Numéro de téléphone (rappels)
              </Label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                value={formData.phoneNumber || ""}
                onChange={handleChange}
                disabled={!isEditing}
                className="bg-gray-200 text-black"
              />
            </div>

            {/*<div>
              <Label htmlFor="allergies" className="mb-1 block">Allergies</Label>
              <Textarea id="allergies" name="allergies" value={formData.allergies || ''} onChange={handleChange} disabled={!isEditing} rows={1} className="bg-gray-200 text-black" />
            </div>

            <div>
              <Label htmlFor="pathologies" className="mb-1 block">Pathologies</Label>
              <Textarea id="pathologies" name="pathologies" value={formData.pathologies || ''} onChange={handleChange} disabled={!isEditing} rows={1} className="bg-gray-200 text-black" />
            </div>*/}
          </form>
        </CardContent>
        <CardFooter className="flex justify-end pt-4">
          <Button
            type="submit"
            form="profile-form"
            variant={isEditing ? "default" : "outline"}
            onClick={isEditing ? undefined : () => setIsEditing(true)}
          >
            {isEditing ? "Enregistrer les modifications" : "Modifier le profil"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}