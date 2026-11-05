# RAYNEX 3D Asset Pipeline

## Source to runtime

1. Contract licensed OEM/supplier geometry and technical metadata.
2. Import CAD/B-rep/mesh data into a controlled conversion workspace.
3. Preserve assembly hierarchy, coordinate frames, part identifiers and source revision.
4. Validate units, scale, handedness, origin, normals and topology.
5. Convert to glTF/GLB; generate mesh LODs and compressed textures/geometry.
6. Create a manifest linking each mesh node to a canonical part ID and exact vehicle configuration.
7. Validate exploded transforms, assembly constraints, repeated fasteners and missing components.
8. Run automated checks and expert QA; publish immutable versioned assets.
9. Deliver through object storage/CDN with progressive loading and device-quality profiles.

## Runtime manifest (illustrative contract)

```json
{
  "assetId": "asset-example",
  "vehicleConfigurationId": "vehicle-config-id",
  "fidelity": "generic-illustrative",
  "sourceRevision": null,
  "licenseRef": null,
  "units": "meter",
  "scene": "vehicle.glb",
  "parts": [{"nodeName":"engine-block","canonicalPartId":null,"coverage":"unverified"}]
}
```

The current web prototype uses generated primitive geometry for interaction testing. It is not an OEM model, does not establish fitment, and must not be used for repair instructions. Replace it only with licensed/validated assets.
