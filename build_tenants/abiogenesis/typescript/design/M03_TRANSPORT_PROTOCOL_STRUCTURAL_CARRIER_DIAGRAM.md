# M03 Transport Protocol Structural Carrier Diagram

**Status**: Active
**Date**: 2026-04-24
**Purpose**: Render the late `M03` transport and result-artifact protocol
boundary as one module-bounded structural carrier diagram before code opens.

## Mermaid UML

```mermaid
classDiagram
class DispatchRequest {
  <<prime>>
  <<authoritative>>
  +kind: "fp_dispatch_request"
  +basisId: string
  +graphFunctionId: string
  +jobId: string
  +dispatchRef: string
  +workerId: string
  +backendId: string
  +resultRef: string
}

class ResultArtifact {
  <<prime>>
  <<authoritative>>
  +resultRef: string
  +dispatchRef: string
  +basisId: string
  +artifactPayload
}

class ResultIngestOutcome {
  <<prime>>
  <<authoritative>>
  +kind
}

class TransportContract {
  <<subordinate>>
  -command
  -argsTemplate
}

class SanitizedEnvironmentPolicy {
  <<subordinate>>
  -prefixes
}

class ArtifactPayload {
  <<subordinate>>
  -edge
  -actor
  -fulfillmentAssessments
}

class FulfillmentAssessment {
  <<subordinate>>
  -id
  -fulfillmentStatus
  -fulfillmentDetail
}

class IdentityIssue {
  <<subordinate>>
  -reason
}

class TransportFailure {
  <<subordinate>>
  -failureClass
  -detail
}

class RuntimeEvent {
  <<downstream>>
}

DispatchRequest *-- TransportContract
TransportContract *-- SanitizedEnvironmentPolicy
DispatchRequest --> ResultArtifact : yields
ResultArtifact *-- ArtifactPayload
ArtifactPayload *-- FulfillmentAssessment
ResultArtifact --> ResultIngestOutcome : ingested into
ResultIngestOutcome *-- IdentityIssue
ResultIngestOutcome *-- TransportFailure
ResultIngestOutcome --> RuntimeEvent : emits or projects into
```

## Reading Notes

- `DispatchRequest`, `ResultArtifact`, and `ResultIngestOutcome` are the only
  prime carriers in this slice.
- transport contract and sanitization policy stay subordinate to the transport
  boundary
- artifact payload and fulfillment entries stay nested inside admitted artifact
  truth
- runtime event truth stays downstream of ingest; transport is not itself a
  rival runtime fact family
