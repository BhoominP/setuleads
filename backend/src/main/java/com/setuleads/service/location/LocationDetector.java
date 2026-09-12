package com.setuleads.service.location;

import org.springframework.stereotype.Component;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class LocationDetector {

    public static class LocationMatchResult {
        private final boolean matched;
        private final int confidence;
        private final String matchedLocation;
        private final String matchedSignal;

        public LocationMatchResult(boolean matched, int confidence, String matchedLocation, String matchedSignal) {
            this.matched = matched;
            this.confidence = confidence;
            this.matchedLocation = matchedLocation;
            this.matchedSignal = matchedSignal;
        }

        public boolean isMatched() { return matched; }
        public int getConfidence() { return confidence; }
        public String getMatchedLocation() { return matchedLocation; }
        public String getMatchedSignal() { return matchedSignal; }
    }

    public LocationMatchResult detectLocation(String targetLocation, String textToSearch) {
        if (targetLocation == null || targetLocation.isBlank() || textToSearch == null || textToSearch.isBlank()) {
            return new LocationMatchResult(false, 0, null, null);
        }

        String normTarget = targetLocation.toLowerCase().trim();
        String normText = textToSearch.toLowerCase();

        // Extract city, state, country parts
        String[] parts = normTarget.split(",");
        String city = parts[0].trim();
        String state = parts.length > 1 ? parts[1].trim() : "";

        // 1. Exact city match with word boundary regex
        Pattern cityExactPattern = Pattern.compile("\\b" + Pattern.quote(city) + "\\b");
        Matcher cityMatcher = cityExactPattern.matcher(normText);

        if (cityMatcher.find()) {
            // Check contextual patterns for extra confidence
            if (normText.contains(city + "-based") || normText.contains("in " + city) || normText.contains("at " + city) || normText.contains(city + " city")) {
                return new LocationMatchResult(true, 95, capitalize(city), "EXACT_CITY_WITH_CONTEXT");
            }
            if (!state.isEmpty() && normText.contains(state)) {
                return new LocationMatchResult(true, 100, capitalize(city) + ", " + capitalize(state), "CITY_AND_STATE");
            }
            return new LocationMatchResult(true, 85, capitalize(city), "EXACT_CITY");
        }

        // 2. Check for "serving <city>" or "located in <state> | <city>"
        if (normText.contains("serving " + city) || normText.contains("deliver to " + city) || normText.contains("near " + city)) {
            return new LocationMatchResult(true, 75, capitalize(city), "SERVICE_LOCATION");
        }

        // 3. State match only if state provided
        if (!state.isEmpty() && state.length() > 2) {
            Pattern statePattern = Pattern.compile("\\b" + Pattern.quote(state) + "\\b");
            if (statePattern.matcher(normText).find()) {
                return new LocationMatchResult(true, 50, capitalize(state), "STATE_ONLY");
            }
        }

        return new LocationMatchResult(false, 0, null, null);
    }

    private String capitalize(String str) {
        if (str == null || str.isEmpty()) return str;
        String[] words = str.split("\\s+");
        StringBuilder sb = new StringBuilder();
        for (String w : words) {
            if (!w.isEmpty()) {
                sb.append(Character.toUpperCase(w.charAt(0))).append(w.substring(1)).append(" ");
            }
        }
        return sb.toString().trim();
    }
}
