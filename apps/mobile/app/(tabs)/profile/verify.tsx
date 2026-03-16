import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft, Shield, CheckCircle, ExternalLink } from "lucide-react-native";
import { Card, CardBody } from "../../../src/components/ui/Card";
import { Badge } from "../../../src/components/ui/Badge";
import { useAuthStore, type VerificationProvider } from "@propilates/shared";
import { supabase } from "../../../src/lib/supabase";

interface VerifiableCred {
  id: string;
  name: string;
  description: string;
  provider: VerificationProvider;
  verified: boolean;
  verifiedAt?: string;
}

const BASE_CREDS: Omit<VerifiableCred, "verified" | "verifiedAt">[] = [
  {
    id: "pma",
    name: "PMA Certification",
    description: "Pilates Method Alliance certified instructor",
    provider: "other",
  },
  {
    id: "balanced_body",
    name: "Balanced Body",
    description: "Balanced Body certified instructor",
    provider: "balanced_body",
  },
  {
    id: "stott",
    name: "STOTT PILATES",
    description: "Merrithew STOTT PILATES certified",
    provider: "stott",
  },
  {
    id: "basi",
    name: "BASI Pilates",
    description: "Body Arts and Science International certified",
    provider: "basi",
  },
];

export default function VerifyScreen() {
  const router = useRouter();
  const { instructor } = useAuthStore();
  const [creds, setCreds] = useState<VerifiableCred[]>(
    BASE_CREDS.map((c) => ({ ...c, verified: false })),
  );

  useEffect(() => {
    if (!instructor) return;
    async function loadVerifications() {
      const { data } = await supabase
        .from("verifications")
        .select("*")
        .eq("instructor_id", instructor!.id);

      if (data && data.length > 0) {
        setCreds((prev) =>
          prev.map((cred) => {
            const match = data.find(
              (v: any) => v.provider === cred.provider,
            );
            return match
              ? { ...cred, verified: true, verifiedAt: match.verified_at }
              : cred;
          }),
        );
      }
    }
    loadVerifications();
  }, [instructor]);

  const handleVerify = (cred: VerifiableCred) => {
    if (!instructor) {
      Alert.alert("Sign In Required", "Please sign in to verify credentials.");
      return;
    }
    // Direct user to the web verification flow
    Alert.alert(
      "Verify Credential",
      `To verify your ${cred.name} certification, please use the web app at pro-pilates.vercel.app/verify. The verification uses Reclaim Protocol for zero-knowledge proof generation.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Open Web",
          onPress: () => Linking.openURL("https://pro-pilates.vercel.app/verify"),
        },
      ],
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-bg">
      {/* Header */}
      <View className="flex-row items-center px-6 py-3 border-b border-border">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <ArrowLeft size={24} color="#a0a0b8" />
        </TouchableOpacity>
        <Text className="text-text-primary font-semibold text-lg flex-1">
          Verify Credentials
        </Text>
      </View>

      <ScrollView className="flex-1 px-6">
        <View className="mt-6 mb-4">
          <View className="flex-row items-center mb-2">
            <Shield size={24} color="#c9a96e" />
            <Text className="text-xl font-bold text-text-primary ml-2">
              On-Chain Verification
            </Text>
          </View>
          <Text className="text-text-secondary">
            Verify your Pilates certifications on-chain using Reclaim Protocol.
            Verified credentials are stored as attestations on XION.
          </Text>
        </View>

        <View className="gap-3 mb-8">
          {creds.map((cred) => (
            <Card key={cred.id}>
              <CardBody>
                <View className="flex-row items-start justify-between">
                  <View className="flex-1 mr-3">
                    <View className="flex-row items-center mb-1">
                      <Text className="text-text-primary font-semibold">
                        {cred.name}
                      </Text>
                      {cred.verified && (
                        <CheckCircle size={16} color="#34d399" style={{ marginLeft: 8 }} />
                      )}
                    </View>
                    <Text className="text-text-secondary text-sm mb-2">
                      {cred.description}
                    </Text>
                    <Badge variant={cred.verified ? "emerald" : "gray"}>
                      {cred.verified ? "Verified" : "Not Verified"}
                    </Badge>
                    {cred.verifiedAt && (
                      <Text className="text-text-muted text-xs mt-1">
                        Verified {new Date(cred.verifiedAt).toLocaleDateString()}
                      </Text>
                    )}
                  </View>
                  <TouchableOpacity
                    className={`px-4 py-2 rounded-lg ${
                      cred.verified ? "bg-bg-card border border-border" : "bg-violet-600"
                    }`}
                    onPress={() => handleVerify(cred)}
                    disabled={cred.verified}
                  >
                    <Text
                      className={`text-sm font-medium ${
                        cred.verified ? "text-text-secondary" : "text-white"
                      }`}
                    >
                      {cred.verified ? "Done" : "Verify"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </CardBody>
            </Card>
          ))}
        </View>

        <View className="bg-bg-card border border-border rounded-xl p-4 mb-8">
          <View className="flex-row items-center mb-2">
            <ExternalLink size={16} color="#55556a" />
            <Text className="text-text-secondary text-sm font-medium ml-2">
              Powered by Reclaim Protocol
            </Text>
          </View>
          <Text className="text-text-secondary text-xs">
            Reclaim Protocol generates zero-knowledge proofs of your
            certifications without exposing your private data.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
