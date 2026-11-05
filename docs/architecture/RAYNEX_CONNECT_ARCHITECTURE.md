# RAYNEX CONNECT architecture decision

The platform supports three connector families behind a common normalized telemetry contract:
1. OBD-II adapter bridge (Bluetooth Classic/BLE/Wi-Fi, device and protocol-specific).
2. Independent cellular/GPS telematics gateway (SIM/4G, authenticated device identity and signed ingestion).
3. OEM cloud APIs (manufacturer authorization, consent and market-specific availability).

The current 1.2.0 archive contains the platform-level module registry and API foundation only. It does not include a live adapter transport, device provisioning, cellular ingestion endpoint, OEM credentials, or production telemetry pipeline. No live connection should be shown until a real source is authenticated and its sample timestamp/freshness is validated. Cloud AI remains cloud-only.
