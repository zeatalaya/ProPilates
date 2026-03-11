import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft, Shield, CheckCircle, ExternalLink } from "lucide-react-native";
import { Card, CardBody } from "../../../src/components/ui/Card";
import { Badge } from "../../../src/components/ui/Badge";

const VERIFIABLE_CREDS = [
  {
    id: "pma",
    name: "PMA Certification",
    description: "Pilates Method Alliance certified instructor",
    provider: "Reclaim Protocol",
    verified: false,
  },
  {
    id: "balanced-body",
    name: "Balanced Body",
    description: "Balanced Body certified instructor",
    provider: "Reclaim Protocol",
    verified: false,
  },
  {
    id: "stott",
    name: "STOTT PILATES",
    description: "Merrithew STOTT PILATES certified",
    provider: "Reclaim Protocol",
    verified: false,
  },
  {
    id: "basi",
    name: "BASI Pilates",
    description: "Body Arts and Science International certified",
    provider: "Reclaim Protocol",
    verified: false,
  },
];

export default function VerifyScreen() {
  const router = useRouter();

  const handleVerify = (credId: string) => {
    // In production: open Reclaim Protocol verification flow
    console.log("Verify:", credId);
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
          {VERIFIABLE_CREDS.map((cred) => (
            <Card key={cred.id}>
              <CardBody>
                <View className="flex-row items-start justify-between">
                  <View className="flex-1 mr-3">
                    <View className="flex-row items-center mb-1">
                      <Text className="text-text-primary font-semibold">
                        {cred.name}
                      </Text>
                      {cred.verified && (
                        <CheckCircle size={16} color="#34d399" className="ml-2" />
                      )}
                    </View>
                    <Text className="text-text-secondary text-sm mb-2">
                      {cred.description}
                    </Text>
                    <Badge variant={cred.verified ? "emerald" : "gray"}>
                      {cred.verified ? "Verified" : "Not Verified"}
                    </Badge>
                  </View>
                  <TouchableOpacity
                    className={`px-4 py-2 rounded-lg ${
                      cred.verified ? "bg-bg-card border border-border" : "bg-violet-600"
                    }`}
                    onPress={() => handleVerify(cred.id)}
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
