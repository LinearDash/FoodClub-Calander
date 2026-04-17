import { View, Text } from "react-native";
import { Badge } from "@foodclub/ui";

export default function MobilePlaceholder() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fef9f2" }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", color: "#1d1c18", marginBottom: 12 }}>
        Food Club WA
      </Text>
      <Text style={{ fontSize: 16, color: "#584237" }}>
        Mobile app coming soon
      </Text>
      <View style={{ marginTop: 24 }}>
        <Badge className="bg-[#f97316] text-white">Expo Router Ready</Badge>
      </View>
    </View>
  );
}
