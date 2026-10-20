import * as v from "valibot";
import { type ExactOwnerOperationPort } from "../shared/public_function_contracts.js";
export declare const catalogInputRowKeySchema: v.StrictObjectSchema<{
    readonly descriptorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly descriptorDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    readonly contributionManifestRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly contributionManifestDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    readonly contributionRowRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly contributionRowDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
}, undefined>;
export declare const catalogAdmissionRowSchema: v.UnionSchema<[v.StrictObjectSchema<{
    readonly inputRowKey: v.StrictObjectSchema<{
        readonly descriptorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly descriptorDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly contributionManifestRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly contributionManifestDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly contributionRowRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly contributionRowDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    }, undefined>;
    readonly subject: v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
    }, undefined>;
    readonly readinessBasis: v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
    }, undefined>;
    readonly evidence: v.SchemaWithPipe<readonly [v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
    }, undefined>, undefined>, v.CheckAction<{
        ref: string;
        digest: `sha256:${string}`;
    }[], "unique_items">]>, v.MinLengthAction<{
        ref: string;
        digest: `sha256:${string}`;
    }[], 1, undefined>]>;
    readonly provenance: v.SchemaWithPipe<readonly [v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
    }, undefined>, undefined>, v.CheckAction<{
        ref: string;
        digest: `sha256:${string}`;
    }[], "unique_items">]>, v.MinLengthAction<{
        ref: string;
        digest: `sha256:${string}`;
    }[], 1, undefined>]>;
    readonly disposition: v.LiteralSchema<"admitted", undefined>;
}, undefined>, v.StrictObjectSchema<{
    readonly reason: v.StrictObjectSchema<{
        readonly code: v.PicklistSchema<readonly ["publication_identity_mismatch", "manifest_row_absent", "manifest_or_provenance_mismatch"], undefined>;
        readonly issuePaths: v.SchemaWithPipe<readonly [v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "json_pointer">]>, undefined>, v.CheckAction<string[], "unique_items">]>;
    }, undefined>;
    readonly inputRowKey: v.StrictObjectSchema<{
        readonly descriptorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly descriptorDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly contributionManifestRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly contributionManifestDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly contributionRowRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly contributionRowDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    }, undefined>;
    readonly subject: v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
    }, undefined>;
    readonly readinessBasis: v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
    }, undefined>;
    readonly evidence: v.SchemaWithPipe<readonly [v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
    }, undefined>, undefined>, v.CheckAction<{
        ref: string;
        digest: `sha256:${string}`;
    }[], "unique_items">]>, v.MinLengthAction<{
        ref: string;
        digest: `sha256:${string}`;
    }[], 1, undefined>]>;
    readonly provenance: v.SchemaWithPipe<readonly [v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
    }, undefined>, undefined>, v.CheckAction<{
        ref: string;
        digest: `sha256:${string}`;
    }[], "unique_items">]>, v.MinLengthAction<{
        ref: string;
        digest: `sha256:${string}`;
    }[], 1, undefined>]>;
    readonly disposition: v.LiteralSchema<"rejected", undefined>;
}, undefined>, v.StrictObjectSchema<{
    readonly reason: v.StrictObjectSchema<{
        readonly code: v.PicklistSchema<readonly ["compatibility_mismatch"], undefined>;
        readonly issuePaths: v.SchemaWithPipe<readonly [v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "json_pointer">]>, undefined>, v.CheckAction<string[], "unique_items">]>;
    }, undefined>;
    readonly inputRowKey: v.StrictObjectSchema<{
        readonly descriptorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly descriptorDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly contributionManifestRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly contributionManifestDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly contributionRowRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly contributionRowDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    }, undefined>;
    readonly subject: v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
    }, undefined>;
    readonly readinessBasis: v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
    }, undefined>;
    readonly evidence: v.SchemaWithPipe<readonly [v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
    }, undefined>, undefined>, v.CheckAction<{
        ref: string;
        digest: `sha256:${string}`;
    }[], "unique_items">]>, v.MinLengthAction<{
        ref: string;
        digest: `sha256:${string}`;
    }[], 1, undefined>]>;
    readonly provenance: v.SchemaWithPipe<readonly [v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
    }, undefined>, undefined>, v.CheckAction<{
        ref: string;
        digest: `sha256:${string}`;
    }[], "unique_items">]>, v.MinLengthAction<{
        ref: string;
        digest: `sha256:${string}`;
    }[], 1, undefined>]>;
    readonly disposition: v.LiteralSchema<"incompatible", undefined>;
}, undefined>, v.StrictObjectSchema<{
    readonly reason: v.StrictObjectSchema<{
        readonly code: v.PicklistSchema<readonly ["canonical_handle_conflict", "manifest_row_ambiguous"], undefined>;
        readonly issuePaths: v.SchemaWithPipe<readonly [v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "json_pointer">]>, undefined>, v.CheckAction<string[], "unique_items">]>;
    }, undefined>;
    readonly inputRowKey: v.StrictObjectSchema<{
        readonly descriptorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly descriptorDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly contributionManifestRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly contributionManifestDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly contributionRowRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly contributionRowDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    }, undefined>;
    readonly subject: v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
    }, undefined>;
    readonly readinessBasis: v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
    }, undefined>;
    readonly evidence: v.SchemaWithPipe<readonly [v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
    }, undefined>, undefined>, v.CheckAction<{
        ref: string;
        digest: `sha256:${string}`;
    }[], "unique_items">]>, v.MinLengthAction<{
        ref: string;
        digest: `sha256:${string}`;
    }[], 1, undefined>]>;
    readonly provenance: v.SchemaWithPipe<readonly [v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
    }, undefined>, undefined>, v.CheckAction<{
        ref: string;
        digest: `sha256:${string}`;
    }[], "unique_items">]>, v.MinLengthAction<{
        ref: string;
        digest: `sha256:${string}`;
    }[], 1, undefined>]>;
    readonly disposition: v.LiteralSchema<"conflicting", undefined>;
}, undefined>, v.StrictObjectSchema<{
    readonly reason: v.StrictObjectSchema<{
        readonly code: v.PicklistSchema<readonly ["readiness_declaration_mismatch", "missing_readiness_prerequisite"], undefined>;
        readonly issuePaths: v.SchemaWithPipe<readonly [v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "json_pointer">]>, undefined>, v.CheckAction<string[], "unique_items">]>;
    }, undefined>;
    readonly inputRowKey: v.StrictObjectSchema<{
        readonly descriptorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly descriptorDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly contributionManifestRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly contributionManifestDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly contributionRowRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly contributionRowDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    }, undefined>;
    readonly subject: v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
    }, undefined>;
    readonly readinessBasis: v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
    }, undefined>;
    readonly evidence: v.SchemaWithPipe<readonly [v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
    }, undefined>, undefined>, v.CheckAction<{
        ref: string;
        digest: `sha256:${string}`;
    }[], "unique_items">]>, v.MinLengthAction<{
        ref: string;
        digest: `sha256:${string}`;
    }[], 1, undefined>]>;
    readonly provenance: v.SchemaWithPipe<readonly [v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
    }, undefined>, undefined>, v.CheckAction<{
        ref: string;
        digest: `sha256:${string}`;
    }[], "unique_items">]>, v.MinLengthAction<{
        ref: string;
        digest: `sha256:${string}`;
    }[], 1, undefined>]>;
    readonly disposition: v.LiteralSchema<"unready", undefined>;
}, undefined>, v.StrictObjectSchema<{
    readonly reason: v.StrictObjectSchema<{
        readonly code: v.PicklistSchema<readonly ["publication_owner_unresolved"], undefined>;
        readonly issuePaths: v.SchemaWithPipe<readonly [v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "json_pointer">]>, undefined>, v.CheckAction<string[], "unique_items">]>;
    }, undefined>;
    readonly inputRowKey: v.StrictObjectSchema<{
        readonly descriptorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly descriptorDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly contributionManifestRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly contributionManifestDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly contributionRowRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly contributionRowDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    }, undefined>;
    readonly subject: v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
    }, undefined>;
    readonly readinessBasis: v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
    }, undefined>;
    readonly evidence: v.SchemaWithPipe<readonly [v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
    }, undefined>, undefined>, v.CheckAction<{
        ref: string;
        digest: `sha256:${string}`;
    }[], "unique_items">]>, v.MinLengthAction<{
        ref: string;
        digest: `sha256:${string}`;
    }[], 1, undefined>]>;
    readonly provenance: v.SchemaWithPipe<readonly [v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
    }, undefined>, undefined>, v.CheckAction<{
        ref: string;
        digest: `sha256:${string}`;
    }[], "unique_items">]>, v.MinLengthAction<{
        ref: string;
        digest: `sha256:${string}`;
    }[], 1, undefined>]>;
    readonly disposition: v.LiteralSchema<"unresolved", undefined>;
}, undefined>], undefined>;
export declare const catalogAdmissionConservationWitnessSchema: v.StrictObjectSchema<{
    readonly relationRef: v.LiteralSchema<"relation://abg/catalog/admission-input-output-conservation@5", undefined>;
    readonly inputRowKeys: v.SchemaWithPipe<readonly [v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
        readonly descriptorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly descriptorDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly contributionManifestRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly contributionManifestDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly contributionRowRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly contributionRowDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    }, undefined>, undefined>, v.CheckAction<{
        descriptorRef: string;
        descriptorDigest: string;
        contributionManifestRef: string;
        contributionManifestDigest: string;
        contributionRowRef: string;
        contributionRowDigest: string;
    }[], "unique_items">]>, v.MinLengthAction<{
        descriptorRef: string;
        descriptorDigest: string;
        contributionManifestRef: string;
        contributionManifestDigest: string;
        contributionRowRef: string;
        contributionRowDigest: string;
    }[], 1, undefined>]>;
    readonly conservationDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
}, undefined>;
export declare const catalogAdmissionResultSchema: v.StrictObjectSchema<{
    readonly catalog: v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
    }, undefined>;
    readonly rows: v.SchemaWithPipe<readonly [v.SchemaWithPipe<readonly [v.ArraySchema<v.UnionSchema<[v.StrictObjectSchema<{
        readonly inputRowKey: v.StrictObjectSchema<{
            readonly descriptorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly descriptorDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly contributionManifestRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly contributionManifestDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly contributionRowRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly contributionRowDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly subject: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
        }, undefined>;
        readonly readinessBasis: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
        }, undefined>;
        readonly evidence: v.SchemaWithPipe<readonly [v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
        }, undefined>, undefined>, v.CheckAction<{
            ref: string;
            digest: `sha256:${string}`;
        }[], "unique_items">]>, v.MinLengthAction<{
            ref: string;
            digest: `sha256:${string}`;
        }[], 1, undefined>]>;
        readonly provenance: v.SchemaWithPipe<readonly [v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
        }, undefined>, undefined>, v.CheckAction<{
            ref: string;
            digest: `sha256:${string}`;
        }[], "unique_items">]>, v.MinLengthAction<{
            ref: string;
            digest: `sha256:${string}`;
        }[], 1, undefined>]>;
        readonly disposition: v.LiteralSchema<"admitted", undefined>;
    }, undefined>, v.StrictObjectSchema<{
        readonly reason: v.StrictObjectSchema<{
            readonly code: v.PicklistSchema<readonly ["publication_identity_mismatch", "manifest_row_absent", "manifest_or_provenance_mismatch"], undefined>;
            readonly issuePaths: v.SchemaWithPipe<readonly [v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "json_pointer">]>, undefined>, v.CheckAction<string[], "unique_items">]>;
        }, undefined>;
        readonly inputRowKey: v.StrictObjectSchema<{
            readonly descriptorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly descriptorDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly contributionManifestRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly contributionManifestDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly contributionRowRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly contributionRowDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly subject: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
        }, undefined>;
        readonly readinessBasis: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
        }, undefined>;
        readonly evidence: v.SchemaWithPipe<readonly [v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
        }, undefined>, undefined>, v.CheckAction<{
            ref: string;
            digest: `sha256:${string}`;
        }[], "unique_items">]>, v.MinLengthAction<{
            ref: string;
            digest: `sha256:${string}`;
        }[], 1, undefined>]>;
        readonly provenance: v.SchemaWithPipe<readonly [v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
        }, undefined>, undefined>, v.CheckAction<{
            ref: string;
            digest: `sha256:${string}`;
        }[], "unique_items">]>, v.MinLengthAction<{
            ref: string;
            digest: `sha256:${string}`;
        }[], 1, undefined>]>;
        readonly disposition: v.LiteralSchema<"rejected", undefined>;
    }, undefined>, v.StrictObjectSchema<{
        readonly reason: v.StrictObjectSchema<{
            readonly code: v.PicklistSchema<readonly ["compatibility_mismatch"], undefined>;
            readonly issuePaths: v.SchemaWithPipe<readonly [v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "json_pointer">]>, undefined>, v.CheckAction<string[], "unique_items">]>;
        }, undefined>;
        readonly inputRowKey: v.StrictObjectSchema<{
            readonly descriptorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly descriptorDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly contributionManifestRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly contributionManifestDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly contributionRowRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly contributionRowDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly subject: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
        }, undefined>;
        readonly readinessBasis: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
        }, undefined>;
        readonly evidence: v.SchemaWithPipe<readonly [v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
        }, undefined>, undefined>, v.CheckAction<{
            ref: string;
            digest: `sha256:${string}`;
        }[], "unique_items">]>, v.MinLengthAction<{
            ref: string;
            digest: `sha256:${string}`;
        }[], 1, undefined>]>;
        readonly provenance: v.SchemaWithPipe<readonly [v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
        }, undefined>, undefined>, v.CheckAction<{
            ref: string;
            digest: `sha256:${string}`;
        }[], "unique_items">]>, v.MinLengthAction<{
            ref: string;
            digest: `sha256:${string}`;
        }[], 1, undefined>]>;
        readonly disposition: v.LiteralSchema<"incompatible", undefined>;
    }, undefined>, v.StrictObjectSchema<{
        readonly reason: v.StrictObjectSchema<{
            readonly code: v.PicklistSchema<readonly ["canonical_handle_conflict", "manifest_row_ambiguous"], undefined>;
            readonly issuePaths: v.SchemaWithPipe<readonly [v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "json_pointer">]>, undefined>, v.CheckAction<string[], "unique_items">]>;
        }, undefined>;
        readonly inputRowKey: v.StrictObjectSchema<{
            readonly descriptorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly descriptorDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly contributionManifestRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly contributionManifestDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly contributionRowRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly contributionRowDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly subject: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
        }, undefined>;
        readonly readinessBasis: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
        }, undefined>;
        readonly evidence: v.SchemaWithPipe<readonly [v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
        }, undefined>, undefined>, v.CheckAction<{
            ref: string;
            digest: `sha256:${string}`;
        }[], "unique_items">]>, v.MinLengthAction<{
            ref: string;
            digest: `sha256:${string}`;
        }[], 1, undefined>]>;
        readonly provenance: v.SchemaWithPipe<readonly [v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
        }, undefined>, undefined>, v.CheckAction<{
            ref: string;
            digest: `sha256:${string}`;
        }[], "unique_items">]>, v.MinLengthAction<{
            ref: string;
            digest: `sha256:${string}`;
        }[], 1, undefined>]>;
        readonly disposition: v.LiteralSchema<"conflicting", undefined>;
    }, undefined>, v.StrictObjectSchema<{
        readonly reason: v.StrictObjectSchema<{
            readonly code: v.PicklistSchema<readonly ["readiness_declaration_mismatch", "missing_readiness_prerequisite"], undefined>;
            readonly issuePaths: v.SchemaWithPipe<readonly [v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "json_pointer">]>, undefined>, v.CheckAction<string[], "unique_items">]>;
        }, undefined>;
        readonly inputRowKey: v.StrictObjectSchema<{
            readonly descriptorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly descriptorDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly contributionManifestRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly contributionManifestDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly contributionRowRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly contributionRowDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly subject: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
        }, undefined>;
        readonly readinessBasis: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
        }, undefined>;
        readonly evidence: v.SchemaWithPipe<readonly [v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
        }, undefined>, undefined>, v.CheckAction<{
            ref: string;
            digest: `sha256:${string}`;
        }[], "unique_items">]>, v.MinLengthAction<{
            ref: string;
            digest: `sha256:${string}`;
        }[], 1, undefined>]>;
        readonly provenance: v.SchemaWithPipe<readonly [v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
        }, undefined>, undefined>, v.CheckAction<{
            ref: string;
            digest: `sha256:${string}`;
        }[], "unique_items">]>, v.MinLengthAction<{
            ref: string;
            digest: `sha256:${string}`;
        }[], 1, undefined>]>;
        readonly disposition: v.LiteralSchema<"unready", undefined>;
    }, undefined>, v.StrictObjectSchema<{
        readonly reason: v.StrictObjectSchema<{
            readonly code: v.PicklistSchema<readonly ["publication_owner_unresolved"], undefined>;
            readonly issuePaths: v.SchemaWithPipe<readonly [v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "json_pointer">]>, undefined>, v.CheckAction<string[], "unique_items">]>;
        }, undefined>;
        readonly inputRowKey: v.StrictObjectSchema<{
            readonly descriptorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly descriptorDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly contributionManifestRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly contributionManifestDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly contributionRowRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly contributionRowDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly subject: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
        }, undefined>;
        readonly readinessBasis: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
        }, undefined>;
        readonly evidence: v.SchemaWithPipe<readonly [v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
        }, undefined>, undefined>, v.CheckAction<{
            ref: string;
            digest: `sha256:${string}`;
        }[], "unique_items">]>, v.MinLengthAction<{
            ref: string;
            digest: `sha256:${string}`;
        }[], 1, undefined>]>;
        readonly provenance: v.SchemaWithPipe<readonly [v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
        }, undefined>, undefined>, v.CheckAction<{
            ref: string;
            digest: `sha256:${string}`;
        }[], "unique_items">]>, v.MinLengthAction<{
            ref: string;
            digest: `sha256:${string}`;
        }[], 1, undefined>]>;
        readonly disposition: v.LiteralSchema<"unresolved", undefined>;
    }, undefined>], undefined>, undefined>, v.CheckAction<({
        inputRowKey: {
            descriptorRef: string;
            descriptorDigest: string;
            contributionManifestRef: string;
            contributionManifestDigest: string;
            contributionRowRef: string;
            contributionRowDigest: string;
        };
        subject: {
            ref: string;
            digest: `sha256:${string}`;
        };
        readinessBasis: {
            ref: string;
            digest: `sha256:${string}`;
        };
        evidence: {
            ref: string;
            digest: `sha256:${string}`;
        }[];
        provenance: {
            ref: string;
            digest: `sha256:${string}`;
        }[];
        disposition: "admitted";
    } | {
        reason: {
            code: "publication_identity_mismatch" | "manifest_row_absent" | "manifest_or_provenance_mismatch";
            issuePaths: string[];
        };
        inputRowKey: {
            descriptorRef: string;
            descriptorDigest: string;
            contributionManifestRef: string;
            contributionManifestDigest: string;
            contributionRowRef: string;
            contributionRowDigest: string;
        };
        subject: {
            ref: string;
            digest: `sha256:${string}`;
        };
        readinessBasis: {
            ref: string;
            digest: `sha256:${string}`;
        };
        evidence: {
            ref: string;
            digest: `sha256:${string}`;
        }[];
        provenance: {
            ref: string;
            digest: `sha256:${string}`;
        }[];
        disposition: "rejected";
    } | {
        reason: {
            code: "compatibility_mismatch";
            issuePaths: string[];
        };
        inputRowKey: {
            descriptorRef: string;
            descriptorDigest: string;
            contributionManifestRef: string;
            contributionManifestDigest: string;
            contributionRowRef: string;
            contributionRowDigest: string;
        };
        subject: {
            ref: string;
            digest: `sha256:${string}`;
        };
        readinessBasis: {
            ref: string;
            digest: `sha256:${string}`;
        };
        evidence: {
            ref: string;
            digest: `sha256:${string}`;
        }[];
        provenance: {
            ref: string;
            digest: `sha256:${string}`;
        }[];
        disposition: "incompatible";
    } | {
        reason: {
            code: "canonical_handle_conflict" | "manifest_row_ambiguous";
            issuePaths: string[];
        };
        inputRowKey: {
            descriptorRef: string;
            descriptorDigest: string;
            contributionManifestRef: string;
            contributionManifestDigest: string;
            contributionRowRef: string;
            contributionRowDigest: string;
        };
        subject: {
            ref: string;
            digest: `sha256:${string}`;
        };
        readinessBasis: {
            ref: string;
            digest: `sha256:${string}`;
        };
        evidence: {
            ref: string;
            digest: `sha256:${string}`;
        }[];
        provenance: {
            ref: string;
            digest: `sha256:${string}`;
        }[];
        disposition: "conflicting";
    } | {
        reason: {
            code: "readiness_declaration_mismatch" | "missing_readiness_prerequisite";
            issuePaths: string[];
        };
        inputRowKey: {
            descriptorRef: string;
            descriptorDigest: string;
            contributionManifestRef: string;
            contributionManifestDigest: string;
            contributionRowRef: string;
            contributionRowDigest: string;
        };
        subject: {
            ref: string;
            digest: `sha256:${string}`;
        };
        readinessBasis: {
            ref: string;
            digest: `sha256:${string}`;
        };
        evidence: {
            ref: string;
            digest: `sha256:${string}`;
        }[];
        provenance: {
            ref: string;
            digest: `sha256:${string}`;
        }[];
        disposition: "unready";
    } | {
        reason: {
            code: "publication_owner_unresolved";
            issuePaths: string[];
        };
        inputRowKey: {
            descriptorRef: string;
            descriptorDigest: string;
            contributionManifestRef: string;
            contributionManifestDigest: string;
            contributionRowRef: string;
            contributionRowDigest: string;
        };
        subject: {
            ref: string;
            digest: `sha256:${string}`;
        };
        readinessBasis: {
            ref: string;
            digest: `sha256:${string}`;
        };
        evidence: {
            ref: string;
            digest: `sha256:${string}`;
        }[];
        provenance: {
            ref: string;
            digest: `sha256:${string}`;
        }[];
        disposition: "unresolved";
    })[], "unique_items">]>, v.MinLengthAction<({
        inputRowKey: {
            descriptorRef: string;
            descriptorDigest: string;
            contributionManifestRef: string;
            contributionManifestDigest: string;
            contributionRowRef: string;
            contributionRowDigest: string;
        };
        subject: {
            ref: string;
            digest: `sha256:${string}`;
        };
        readinessBasis: {
            ref: string;
            digest: `sha256:${string}`;
        };
        evidence: {
            ref: string;
            digest: `sha256:${string}`;
        }[];
        provenance: {
            ref: string;
            digest: `sha256:${string}`;
        }[];
        disposition: "admitted";
    } | {
        reason: {
            code: "publication_identity_mismatch" | "manifest_row_absent" | "manifest_or_provenance_mismatch";
            issuePaths: string[];
        };
        inputRowKey: {
            descriptorRef: string;
            descriptorDigest: string;
            contributionManifestRef: string;
            contributionManifestDigest: string;
            contributionRowRef: string;
            contributionRowDigest: string;
        };
        subject: {
            ref: string;
            digest: `sha256:${string}`;
        };
        readinessBasis: {
            ref: string;
            digest: `sha256:${string}`;
        };
        evidence: {
            ref: string;
            digest: `sha256:${string}`;
        }[];
        provenance: {
            ref: string;
            digest: `sha256:${string}`;
        }[];
        disposition: "rejected";
    } | {
        reason: {
            code: "compatibility_mismatch";
            issuePaths: string[];
        };
        inputRowKey: {
            descriptorRef: string;
            descriptorDigest: string;
            contributionManifestRef: string;
            contributionManifestDigest: string;
            contributionRowRef: string;
            contributionRowDigest: string;
        };
        subject: {
            ref: string;
            digest: `sha256:${string}`;
        };
        readinessBasis: {
            ref: string;
            digest: `sha256:${string}`;
        };
        evidence: {
            ref: string;
            digest: `sha256:${string}`;
        }[];
        provenance: {
            ref: string;
            digest: `sha256:${string}`;
        }[];
        disposition: "incompatible";
    } | {
        reason: {
            code: "canonical_handle_conflict" | "manifest_row_ambiguous";
            issuePaths: string[];
        };
        inputRowKey: {
            descriptorRef: string;
            descriptorDigest: string;
            contributionManifestRef: string;
            contributionManifestDigest: string;
            contributionRowRef: string;
            contributionRowDigest: string;
        };
        subject: {
            ref: string;
            digest: `sha256:${string}`;
        };
        readinessBasis: {
            ref: string;
            digest: `sha256:${string}`;
        };
        evidence: {
            ref: string;
            digest: `sha256:${string}`;
        }[];
        provenance: {
            ref: string;
            digest: `sha256:${string}`;
        }[];
        disposition: "conflicting";
    } | {
        reason: {
            code: "readiness_declaration_mismatch" | "missing_readiness_prerequisite";
            issuePaths: string[];
        };
        inputRowKey: {
            descriptorRef: string;
            descriptorDigest: string;
            contributionManifestRef: string;
            contributionManifestDigest: string;
            contributionRowRef: string;
            contributionRowDigest: string;
        };
        subject: {
            ref: string;
            digest: `sha256:${string}`;
        };
        readinessBasis: {
            ref: string;
            digest: `sha256:${string}`;
        };
        evidence: {
            ref: string;
            digest: `sha256:${string}`;
        }[];
        provenance: {
            ref: string;
            digest: `sha256:${string}`;
        }[];
        disposition: "unready";
    } | {
        reason: {
            code: "publication_owner_unresolved";
            issuePaths: string[];
        };
        inputRowKey: {
            descriptorRef: string;
            descriptorDigest: string;
            contributionManifestRef: string;
            contributionManifestDigest: string;
            contributionRowRef: string;
            contributionRowDigest: string;
        };
        subject: {
            ref: string;
            digest: `sha256:${string}`;
        };
        readinessBasis: {
            ref: string;
            digest: `sha256:${string}`;
        };
        evidence: {
            ref: string;
            digest: `sha256:${string}`;
        }[];
        provenance: {
            ref: string;
            digest: `sha256:${string}`;
        }[];
        disposition: "unresolved";
    })[], 1, undefined>]>;
    readonly conservation: v.StrictObjectSchema<{
        readonly relationRef: v.LiteralSchema<"relation://abg/catalog/admission-input-output-conservation@5", undefined>;
        readonly inputRowKeys: v.SchemaWithPipe<readonly [v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
            readonly descriptorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly descriptorDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly contributionManifestRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly contributionManifestDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly contributionRowRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly contributionRowDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>, undefined>, v.CheckAction<{
            descriptorRef: string;
            descriptorDigest: string;
            contributionManifestRef: string;
            contributionManifestDigest: string;
            contributionRowRef: string;
            contributionRowDigest: string;
        }[], "unique_items">]>, v.MinLengthAction<{
            descriptorRef: string;
            descriptorDigest: string;
            contributionManifestRef: string;
            contributionManifestDigest: string;
            contributionRowRef: string;
            contributionRowDigest: string;
        }[], 1, undefined>]>;
        readonly conservationDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    }, undefined>;
}, undefined>;
export type CatalogInputRowKey = v.InferOutput<typeof catalogInputRowKeySchema>;
export type CatalogAdmissionRow = v.InferOutput<typeof catalogAdmissionRowSchema>;
export type CatalogAdmissionConservationWitness = v.InferOutput<typeof catalogAdmissionConservationWitnessSchema>;
export declare function constructCatalogAdmissionConservationWitness(inputRowKeys: readonly CatalogInputRowKey[]): CatalogAdmissionConservationWitness;
export type CatalogAdmissionResult = v.InferOutput<typeof catalogAdmissionResultSchema>;
export declare function admitCatalogAdmissionResult(exactInputRowKeys: readonly CatalogInputRowKey[], candidate: unknown): Readonly<{
    disposition: "admitted";
    value: CatalogAdmissionResult;
} | {
    disposition: "refused";
    issuePaths: readonly string[];
}>;
declare const admit: import("../shared/public_function_contracts.js").OwnerContractSourceDeclaration<{
    readonly operationId: "abg.operation.catalog.admit";
    readonly memberKey: "admit";
}, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
    workspaceBinding: {
        ref: string;
        digest: `sha256:${string}`;
    };
    descriptors: {
        ref: string;
        digest: `sha256:${string}`;
    }[];
    contributionManifests: {
        ref: string;
        digest: `sha256:${string}`;
    }[];
    resolvedLock: {
        ref: string;
        digest: `sha256:${string}`;
    };
}, {
    workspaceBinding: {
        ref: string;
        digest: `sha256:${string}`;
    };
    descriptors: {
        ref: string;
        digest: `sha256:${string}`;
    }[];
    contributionManifests: {
        ref: string;
        digest: `sha256:${string}`;
    }[];
    resolvedLock: {
        ref: string;
        digest: `sha256:${string}`;
    };
}>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
    catalog: {
        ref: string;
        digest: `sha256:${string}`;
    };
    rows: ({
        inputRowKey: {
            descriptorRef: string;
            descriptorDigest: string;
            contributionManifestRef: string;
            contributionManifestDigest: string;
            contributionRowRef: string;
            contributionRowDigest: string;
        };
        subject: {
            ref: string;
            digest: `sha256:${string}`;
        };
        readinessBasis: {
            ref: string;
            digest: `sha256:${string}`;
        };
        evidence: {
            ref: string;
            digest: `sha256:${string}`;
        }[];
        provenance: {
            ref: string;
            digest: `sha256:${string}`;
        }[];
        disposition: "admitted";
    } | {
        reason: {
            code: "publication_identity_mismatch" | "manifest_row_absent" | "manifest_or_provenance_mismatch";
            issuePaths: string[];
        };
        inputRowKey: {
            descriptorRef: string;
            descriptorDigest: string;
            contributionManifestRef: string;
            contributionManifestDigest: string;
            contributionRowRef: string;
            contributionRowDigest: string;
        };
        subject: {
            ref: string;
            digest: `sha256:${string}`;
        };
        readinessBasis: {
            ref: string;
            digest: `sha256:${string}`;
        };
        evidence: {
            ref: string;
            digest: `sha256:${string}`;
        }[];
        provenance: {
            ref: string;
            digest: `sha256:${string}`;
        }[];
        disposition: "rejected";
    } | {
        reason: {
            code: "compatibility_mismatch";
            issuePaths: string[];
        };
        inputRowKey: {
            descriptorRef: string;
            descriptorDigest: string;
            contributionManifestRef: string;
            contributionManifestDigest: string;
            contributionRowRef: string;
            contributionRowDigest: string;
        };
        subject: {
            ref: string;
            digest: `sha256:${string}`;
        };
        readinessBasis: {
            ref: string;
            digest: `sha256:${string}`;
        };
        evidence: {
            ref: string;
            digest: `sha256:${string}`;
        }[];
        provenance: {
            ref: string;
            digest: `sha256:${string}`;
        }[];
        disposition: "incompatible";
    } | {
        reason: {
            code: "canonical_handle_conflict" | "manifest_row_ambiguous";
            issuePaths: string[];
        };
        inputRowKey: {
            descriptorRef: string;
            descriptorDigest: string;
            contributionManifestRef: string;
            contributionManifestDigest: string;
            contributionRowRef: string;
            contributionRowDigest: string;
        };
        subject: {
            ref: string;
            digest: `sha256:${string}`;
        };
        readinessBasis: {
            ref: string;
            digest: `sha256:${string}`;
        };
        evidence: {
            ref: string;
            digest: `sha256:${string}`;
        }[];
        provenance: {
            ref: string;
            digest: `sha256:${string}`;
        }[];
        disposition: "conflicting";
    } | {
        reason: {
            code: "readiness_declaration_mismatch" | "missing_readiness_prerequisite";
            issuePaths: string[];
        };
        inputRowKey: {
            descriptorRef: string;
            descriptorDigest: string;
            contributionManifestRef: string;
            contributionManifestDigest: string;
            contributionRowRef: string;
            contributionRowDigest: string;
        };
        subject: {
            ref: string;
            digest: `sha256:${string}`;
        };
        readinessBasis: {
            ref: string;
            digest: `sha256:${string}`;
        };
        evidence: {
            ref: string;
            digest: `sha256:${string}`;
        }[];
        provenance: {
            ref: string;
            digest: `sha256:${string}`;
        }[];
        disposition: "unready";
    } | {
        reason: {
            code: "publication_owner_unresolved";
            issuePaths: string[];
        };
        inputRowKey: {
            descriptorRef: string;
            descriptorDigest: string;
            contributionManifestRef: string;
            contributionManifestDigest: string;
            contributionRowRef: string;
            contributionRowDigest: string;
        };
        subject: {
            ref: string;
            digest: `sha256:${string}`;
        };
        readinessBasis: {
            ref: string;
            digest: `sha256:${string}`;
        };
        evidence: {
            ref: string;
            digest: `sha256:${string}`;
        }[];
        provenance: {
            ref: string;
            digest: `sha256:${string}`;
        }[];
        disposition: "unresolved";
    })[];
    conservation: {
        relationRef: "relation://abg/catalog/admission-input-output-conservation@5";
        inputRowKeys: {
            descriptorRef: string;
            descriptorDigest: string;
            contributionManifestRef: string;
            contributionManifestDigest: string;
            contributionRowRef: string;
            contributionRowDigest: string;
        }[];
        conservationDigest: string;
    };
}, {
    catalog: {
        ref: string;
        digest: `sha256:${string}`;
    };
    rows: ({
        inputRowKey: {
            descriptorRef: string;
            descriptorDigest: string;
            contributionManifestRef: string;
            contributionManifestDigest: string;
            contributionRowRef: string;
            contributionRowDigest: string;
        };
        subject: {
            ref: string;
            digest: `sha256:${string}`;
        };
        readinessBasis: {
            ref: string;
            digest: `sha256:${string}`;
        };
        evidence: {
            ref: string;
            digest: `sha256:${string}`;
        }[];
        provenance: {
            ref: string;
            digest: `sha256:${string}`;
        }[];
        disposition: "admitted";
    } | {
        reason: {
            code: "publication_identity_mismatch" | "manifest_row_absent" | "manifest_or_provenance_mismatch";
            issuePaths: string[];
        };
        inputRowKey: {
            descriptorRef: string;
            descriptorDigest: string;
            contributionManifestRef: string;
            contributionManifestDigest: string;
            contributionRowRef: string;
            contributionRowDigest: string;
        };
        subject: {
            ref: string;
            digest: `sha256:${string}`;
        };
        readinessBasis: {
            ref: string;
            digest: `sha256:${string}`;
        };
        evidence: {
            ref: string;
            digest: `sha256:${string}`;
        }[];
        provenance: {
            ref: string;
            digest: `sha256:${string}`;
        }[];
        disposition: "rejected";
    } | {
        reason: {
            code: "compatibility_mismatch";
            issuePaths: string[];
        };
        inputRowKey: {
            descriptorRef: string;
            descriptorDigest: string;
            contributionManifestRef: string;
            contributionManifestDigest: string;
            contributionRowRef: string;
            contributionRowDigest: string;
        };
        subject: {
            ref: string;
            digest: `sha256:${string}`;
        };
        readinessBasis: {
            ref: string;
            digest: `sha256:${string}`;
        };
        evidence: {
            ref: string;
            digest: `sha256:${string}`;
        }[];
        provenance: {
            ref: string;
            digest: `sha256:${string}`;
        }[];
        disposition: "incompatible";
    } | {
        reason: {
            code: "canonical_handle_conflict" | "manifest_row_ambiguous";
            issuePaths: string[];
        };
        inputRowKey: {
            descriptorRef: string;
            descriptorDigest: string;
            contributionManifestRef: string;
            contributionManifestDigest: string;
            contributionRowRef: string;
            contributionRowDigest: string;
        };
        subject: {
            ref: string;
            digest: `sha256:${string}`;
        };
        readinessBasis: {
            ref: string;
            digest: `sha256:${string}`;
        };
        evidence: {
            ref: string;
            digest: `sha256:${string}`;
        }[];
        provenance: {
            ref: string;
            digest: `sha256:${string}`;
        }[];
        disposition: "conflicting";
    } | {
        reason: {
            code: "readiness_declaration_mismatch" | "missing_readiness_prerequisite";
            issuePaths: string[];
        };
        inputRowKey: {
            descriptorRef: string;
            descriptorDigest: string;
            contributionManifestRef: string;
            contributionManifestDigest: string;
            contributionRowRef: string;
            contributionRowDigest: string;
        };
        subject: {
            ref: string;
            digest: `sha256:${string}`;
        };
        readinessBasis: {
            ref: string;
            digest: `sha256:${string}`;
        };
        evidence: {
            ref: string;
            digest: `sha256:${string}`;
        }[];
        provenance: {
            ref: string;
            digest: `sha256:${string}`;
        }[];
        disposition: "unready";
    } | {
        reason: {
            code: "publication_owner_unresolved";
            issuePaths: string[];
        };
        inputRowKey: {
            descriptorRef: string;
            descriptorDigest: string;
            contributionManifestRef: string;
            contributionManifestDigest: string;
            contributionRowRef: string;
            contributionRowDigest: string;
        };
        subject: {
            ref: string;
            digest: `sha256:${string}`;
        };
        readinessBasis: {
            ref: string;
            digest: `sha256:${string}`;
        };
        evidence: {
            ref: string;
            digest: `sha256:${string}`;
        }[];
        provenance: {
            ref: string;
            digest: `sha256:${string}`;
        }[];
        disposition: "unresolved";
    })[];
    conservation: {
        relationRef: "relation://abg/catalog/admission-input-output-conservation@5";
        inputRowKeys: {
            descriptorRef: string;
            descriptorDigest: string;
            contributionManifestRef: string;
            contributionManifestDigest: string;
            contributionRowRef: string;
            contributionRowDigest: string;
        }[];
        conservationDigest: string;
    };
}>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
    code: "malformed_descriptor" | "malformed_contribution" | "binding_mismatch" | "lock_mismatch" | "conservation_failure";
    issuePaths: string[];
    evidenceRefs: string[];
}, {
    code: "malformed_descriptor" | "malformed_contribution" | "binding_mismatch" | "lock_mismatch" | "conservation_failure";
    issuePaths: string[];
    evidenceRefs: string[];
}>, null>;
declare const allowlist: import("../shared/public_function_contracts.js").OwnerContractSourceDeclaration<{
    readonly operationId: "abg.operation.catalog.view";
    readonly memberKey: "allowlist";
}, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
    catalog: {
        ref: string;
        digest: `sha256:${string}`;
    };
    allowlist: string[];
}, {
    catalog: {
        ref: string;
        digest: `sha256:${string}`;
    };
    allowlist: string[];
}>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
    view: {
        ref: string;
        digest: `sha256:${string}`;
    };
    effectiveHandles: string[];
    residuals: {
        kind: "typed_residual";
        code: string;
        subjectRef: string;
        message: string;
    }[];
}, {
    view: {
        ref: string;
        digest: `sha256:${string}`;
    };
    effectiveHandles: string[];
    residuals: {
        kind: "typed_residual";
        code: string;
        subjectRef: string;
        message: string;
    }[];
}>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
    code: "unknown" | "not_ready" | "duplicate" | "ambiguous" | "unauthorized" | "inadmissible";
    issuePaths: string[];
    evidenceRefs: string[];
}, {
    code: "unknown" | "not_ready" | "duplicate" | "ambiguous" | "unauthorized" | "inadmissible";
    issuePaths: string[];
    evidenceRefs: string[];
}>, null>;
declare const nodeType: import("../shared/public_function_contracts.js").OwnerContractSourceDeclaration<{
    readonly operationId: "abg.operation.catalog.apply";
    readonly memberKey: "node_type";
}, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
    applicationKind: "node_type";
    catalogRow: {
        ref: string;
        digest: `sha256:${string}`;
    };
    catalogView: {
        ref: string;
        digest: `sha256:${string}`;
    };
    declaration: {
        ref: string;
        digest: `sha256:${string}`;
    };
    target: {
        ref: string;
        digest: `sha256:${string}`;
    } | null;
    applicationBasis: {
        ref: string;
        digest: `sha256:${string}`;
    };
    validationReceipt: {
        ref: string;
        digest: `sha256:${string}`;
    };
    contributor: {
        ref: string;
        digest: `sha256:${string}`;
    };
}, {
    applicationKind: "node_type";
    catalogRow: {
        ref: string;
        digest: `sha256:${string}`;
    };
    catalogView: {
        ref: string;
        digest: `sha256:${string}`;
    };
    declaration: {
        ref: string;
        digest: `sha256:${string}`;
    };
    target: {
        ref: string;
        digest: `sha256:${string}`;
    } | null;
    applicationBasis: {
        ref: string;
        digest: `sha256:${string}`;
    };
    validationReceipt: {
        ref: string;
        digest: `sha256:${string}`;
    };
    contributor: {
        ref: string;
        digest: `sha256:${string}`;
    };
}>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
    applicationKind: "node_type";
    application: {
        ref: string;
        digest: `sha256:${string}`;
    };
    target: {
        ref: string;
        digest: `sha256:${string}`;
    } | null;
    evidence: {
        ref: string;
        digest: `sha256:${string}`;
    }[];
    provenance: {
        ref: string;
        digest: `sha256:${string}`;
    }[];
}, {
    applicationKind: "node_type";
    application: {
        ref: string;
        digest: `sha256:${string}`;
    };
    target: {
        ref: string;
        digest: `sha256:${string}`;
    } | null;
    evidence: {
        ref: string;
        digest: `sha256:${string}`;
    }[];
    provenance: {
        ref: string;
        digest: `sha256:${string}`;
    }[];
}>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
    code: "unready" | "kind_mismatch" | "view_mismatch" | "target_mismatch" | "application_mismatch" | "callability_mismatch" | "invalid_validation_receipt" | "invalid_contributor";
    issuePaths: string[];
    evidenceRefs: string[];
}, {
    code: "unready" | "kind_mismatch" | "view_mismatch" | "target_mismatch" | "application_mismatch" | "callability_mismatch" | "invalid_validation_receipt" | "invalid_contributor";
    issuePaths: string[];
    evidenceRefs: string[];
}>, null>;
declare const overlay: import("../shared/public_function_contracts.js").OwnerContractSourceDeclaration<{
    readonly operationId: "abg.operation.catalog.apply";
    readonly memberKey: "overlay";
}, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
    applicationKind: "overlay";
    catalogRow: {
        ref: string;
        digest: `sha256:${string}`;
    };
    catalogView: {
        ref: string;
        digest: `sha256:${string}`;
    };
    declaration: {
        ref: string;
        digest: `sha256:${string}`;
    };
    target: {
        ref: string;
        digest: `sha256:${string}`;
    } | null;
    applicationBasis: {
        ref: string;
        digest: `sha256:${string}`;
    };
    validationReceipt: {
        ref: string;
        digest: `sha256:${string}`;
    };
    contributor: {
        ref: string;
        digest: `sha256:${string}`;
    };
}, {
    applicationKind: "overlay";
    catalogRow: {
        ref: string;
        digest: `sha256:${string}`;
    };
    catalogView: {
        ref: string;
        digest: `sha256:${string}`;
    };
    declaration: {
        ref: string;
        digest: `sha256:${string}`;
    };
    target: {
        ref: string;
        digest: `sha256:${string}`;
    } | null;
    applicationBasis: {
        ref: string;
        digest: `sha256:${string}`;
    };
    validationReceipt: {
        ref: string;
        digest: `sha256:${string}`;
    };
    contributor: {
        ref: string;
        digest: `sha256:${string}`;
    };
}>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
    applicationKind: "overlay";
    application: {
        ref: string;
        digest: `sha256:${string}`;
    };
    target: {
        ref: string;
        digest: `sha256:${string}`;
    } | null;
    evidence: {
        ref: string;
        digest: `sha256:${string}`;
    }[];
    provenance: {
        ref: string;
        digest: `sha256:${string}`;
    }[];
}, {
    applicationKind: "overlay";
    application: {
        ref: string;
        digest: `sha256:${string}`;
    };
    target: {
        ref: string;
        digest: `sha256:${string}`;
    } | null;
    evidence: {
        ref: string;
        digest: `sha256:${string}`;
    }[];
    provenance: {
        ref: string;
        digest: `sha256:${string}`;
    }[];
}>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
    code: "unready" | "kind_mismatch" | "view_mismatch" | "target_mismatch" | "application_mismatch" | "callability_mismatch" | "invalid_validation_receipt" | "invalid_contributor";
    issuePaths: string[];
    evidenceRefs: string[];
}, {
    code: "unready" | "kind_mismatch" | "view_mismatch" | "target_mismatch" | "application_mismatch" | "callability_mismatch" | "invalid_validation_receipt" | "invalid_contributor";
    issuePaths: string[];
    evidenceRefs: string[];
}>, null>;
export declare const CATALOG_OPERATION_CONTRACTS: Readonly<{
    admit: import("../shared/public_function_contracts.js").OwnerContractSourceDeclaration<{
        readonly operationId: "abg.operation.catalog.admit";
        readonly memberKey: "admit";
    }, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
        workspaceBinding: {
            ref: string;
            digest: `sha256:${string}`;
        };
        descriptors: {
            ref: string;
            digest: `sha256:${string}`;
        }[];
        contributionManifests: {
            ref: string;
            digest: `sha256:${string}`;
        }[];
        resolvedLock: {
            ref: string;
            digest: `sha256:${string}`;
        };
    }, {
        workspaceBinding: {
            ref: string;
            digest: `sha256:${string}`;
        };
        descriptors: {
            ref: string;
            digest: `sha256:${string}`;
        }[];
        contributionManifests: {
            ref: string;
            digest: `sha256:${string}`;
        }[];
        resolvedLock: {
            ref: string;
            digest: `sha256:${string}`;
        };
    }>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
        catalog: {
            ref: string;
            digest: `sha256:${string}`;
        };
        rows: ({
            inputRowKey: {
                descriptorRef: string;
                descriptorDigest: string;
                contributionManifestRef: string;
                contributionManifestDigest: string;
                contributionRowRef: string;
                contributionRowDigest: string;
            };
            subject: {
                ref: string;
                digest: `sha256:${string}`;
            };
            readinessBasis: {
                ref: string;
                digest: `sha256:${string}`;
            };
            evidence: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
            provenance: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
            disposition: "admitted";
        } | {
            reason: {
                code: "publication_identity_mismatch" | "manifest_row_absent" | "manifest_or_provenance_mismatch";
                issuePaths: string[];
            };
            inputRowKey: {
                descriptorRef: string;
                descriptorDigest: string;
                contributionManifestRef: string;
                contributionManifestDigest: string;
                contributionRowRef: string;
                contributionRowDigest: string;
            };
            subject: {
                ref: string;
                digest: `sha256:${string}`;
            };
            readinessBasis: {
                ref: string;
                digest: `sha256:${string}`;
            };
            evidence: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
            provenance: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
            disposition: "rejected";
        } | {
            reason: {
                code: "compatibility_mismatch";
                issuePaths: string[];
            };
            inputRowKey: {
                descriptorRef: string;
                descriptorDigest: string;
                contributionManifestRef: string;
                contributionManifestDigest: string;
                contributionRowRef: string;
                contributionRowDigest: string;
            };
            subject: {
                ref: string;
                digest: `sha256:${string}`;
            };
            readinessBasis: {
                ref: string;
                digest: `sha256:${string}`;
            };
            evidence: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
            provenance: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
            disposition: "incompatible";
        } | {
            reason: {
                code: "canonical_handle_conflict" | "manifest_row_ambiguous";
                issuePaths: string[];
            };
            inputRowKey: {
                descriptorRef: string;
                descriptorDigest: string;
                contributionManifestRef: string;
                contributionManifestDigest: string;
                contributionRowRef: string;
                contributionRowDigest: string;
            };
            subject: {
                ref: string;
                digest: `sha256:${string}`;
            };
            readinessBasis: {
                ref: string;
                digest: `sha256:${string}`;
            };
            evidence: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
            provenance: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
            disposition: "conflicting";
        } | {
            reason: {
                code: "readiness_declaration_mismatch" | "missing_readiness_prerequisite";
                issuePaths: string[];
            };
            inputRowKey: {
                descriptorRef: string;
                descriptorDigest: string;
                contributionManifestRef: string;
                contributionManifestDigest: string;
                contributionRowRef: string;
                contributionRowDigest: string;
            };
            subject: {
                ref: string;
                digest: `sha256:${string}`;
            };
            readinessBasis: {
                ref: string;
                digest: `sha256:${string}`;
            };
            evidence: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
            provenance: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
            disposition: "unready";
        } | {
            reason: {
                code: "publication_owner_unresolved";
                issuePaths: string[];
            };
            inputRowKey: {
                descriptorRef: string;
                descriptorDigest: string;
                contributionManifestRef: string;
                contributionManifestDigest: string;
                contributionRowRef: string;
                contributionRowDigest: string;
            };
            subject: {
                ref: string;
                digest: `sha256:${string}`;
            };
            readinessBasis: {
                ref: string;
                digest: `sha256:${string}`;
            };
            evidence: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
            provenance: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
            disposition: "unresolved";
        })[];
        conservation: {
            relationRef: "relation://abg/catalog/admission-input-output-conservation@5";
            inputRowKeys: {
                descriptorRef: string;
                descriptorDigest: string;
                contributionManifestRef: string;
                contributionManifestDigest: string;
                contributionRowRef: string;
                contributionRowDigest: string;
            }[];
            conservationDigest: string;
        };
    }, {
        catalog: {
            ref: string;
            digest: `sha256:${string}`;
        };
        rows: ({
            inputRowKey: {
                descriptorRef: string;
                descriptorDigest: string;
                contributionManifestRef: string;
                contributionManifestDigest: string;
                contributionRowRef: string;
                contributionRowDigest: string;
            };
            subject: {
                ref: string;
                digest: `sha256:${string}`;
            };
            readinessBasis: {
                ref: string;
                digest: `sha256:${string}`;
            };
            evidence: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
            provenance: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
            disposition: "admitted";
        } | {
            reason: {
                code: "publication_identity_mismatch" | "manifest_row_absent" | "manifest_or_provenance_mismatch";
                issuePaths: string[];
            };
            inputRowKey: {
                descriptorRef: string;
                descriptorDigest: string;
                contributionManifestRef: string;
                contributionManifestDigest: string;
                contributionRowRef: string;
                contributionRowDigest: string;
            };
            subject: {
                ref: string;
                digest: `sha256:${string}`;
            };
            readinessBasis: {
                ref: string;
                digest: `sha256:${string}`;
            };
            evidence: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
            provenance: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
            disposition: "rejected";
        } | {
            reason: {
                code: "compatibility_mismatch";
                issuePaths: string[];
            };
            inputRowKey: {
                descriptorRef: string;
                descriptorDigest: string;
                contributionManifestRef: string;
                contributionManifestDigest: string;
                contributionRowRef: string;
                contributionRowDigest: string;
            };
            subject: {
                ref: string;
                digest: `sha256:${string}`;
            };
            readinessBasis: {
                ref: string;
                digest: `sha256:${string}`;
            };
            evidence: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
            provenance: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
            disposition: "incompatible";
        } | {
            reason: {
                code: "canonical_handle_conflict" | "manifest_row_ambiguous";
                issuePaths: string[];
            };
            inputRowKey: {
                descriptorRef: string;
                descriptorDigest: string;
                contributionManifestRef: string;
                contributionManifestDigest: string;
                contributionRowRef: string;
                contributionRowDigest: string;
            };
            subject: {
                ref: string;
                digest: `sha256:${string}`;
            };
            readinessBasis: {
                ref: string;
                digest: `sha256:${string}`;
            };
            evidence: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
            provenance: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
            disposition: "conflicting";
        } | {
            reason: {
                code: "readiness_declaration_mismatch" | "missing_readiness_prerequisite";
                issuePaths: string[];
            };
            inputRowKey: {
                descriptorRef: string;
                descriptorDigest: string;
                contributionManifestRef: string;
                contributionManifestDigest: string;
                contributionRowRef: string;
                contributionRowDigest: string;
            };
            subject: {
                ref: string;
                digest: `sha256:${string}`;
            };
            readinessBasis: {
                ref: string;
                digest: `sha256:${string}`;
            };
            evidence: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
            provenance: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
            disposition: "unready";
        } | {
            reason: {
                code: "publication_owner_unresolved";
                issuePaths: string[];
            };
            inputRowKey: {
                descriptorRef: string;
                descriptorDigest: string;
                contributionManifestRef: string;
                contributionManifestDigest: string;
                contributionRowRef: string;
                contributionRowDigest: string;
            };
            subject: {
                ref: string;
                digest: `sha256:${string}`;
            };
            readinessBasis: {
                ref: string;
                digest: `sha256:${string}`;
            };
            evidence: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
            provenance: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
            disposition: "unresolved";
        })[];
        conservation: {
            relationRef: "relation://abg/catalog/admission-input-output-conservation@5";
            inputRowKeys: {
                descriptorRef: string;
                descriptorDigest: string;
                contributionManifestRef: string;
                contributionManifestDigest: string;
                contributionRowRef: string;
                contributionRowDigest: string;
            }[];
            conservationDigest: string;
        };
    }>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
        code: "malformed_descriptor" | "malformed_contribution" | "binding_mismatch" | "lock_mismatch" | "conservation_failure";
        issuePaths: string[];
        evidenceRefs: string[];
    }, {
        code: "malformed_descriptor" | "malformed_contribution" | "binding_mismatch" | "lock_mismatch" | "conservation_failure";
        issuePaths: string[];
        evidenceRefs: string[];
    }>, null>;
    view: Readonly<{
        allowlist: import("../shared/public_function_contracts.js").OwnerContractSourceDeclaration<{
            readonly operationId: "abg.operation.catalog.view";
            readonly memberKey: "allowlist";
        }, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
            catalog: {
                ref: string;
                digest: `sha256:${string}`;
            };
            allowlist: string[];
        }, {
            catalog: {
                ref: string;
                digest: `sha256:${string}`;
            };
            allowlist: string[];
        }>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
            view: {
                ref: string;
                digest: `sha256:${string}`;
            };
            effectiveHandles: string[];
            residuals: {
                kind: "typed_residual";
                code: string;
                subjectRef: string;
                message: string;
            }[];
        }, {
            view: {
                ref: string;
                digest: `sha256:${string}`;
            };
            effectiveHandles: string[];
            residuals: {
                kind: "typed_residual";
                code: string;
                subjectRef: string;
                message: string;
            }[];
        }>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
            code: "unknown" | "not_ready" | "duplicate" | "ambiguous" | "unauthorized" | "inadmissible";
            issuePaths: string[];
            evidenceRefs: string[];
        }, {
            code: "unknown" | "not_ready" | "duplicate" | "ambiguous" | "unauthorized" | "inadmissible";
            issuePaths: string[];
            evidenceRefs: string[];
        }>, null>;
    }>;
    apply: Readonly<{
        node_type: import("../shared/public_function_contracts.js").OwnerContractSourceDeclaration<{
            readonly operationId: "abg.operation.catalog.apply";
            readonly memberKey: "node_type";
        }, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
            applicationKind: "node_type";
            catalogRow: {
                ref: string;
                digest: `sha256:${string}`;
            };
            catalogView: {
                ref: string;
                digest: `sha256:${string}`;
            };
            declaration: {
                ref: string;
                digest: `sha256:${string}`;
            };
            target: {
                ref: string;
                digest: `sha256:${string}`;
            } | null;
            applicationBasis: {
                ref: string;
                digest: `sha256:${string}`;
            };
            validationReceipt: {
                ref: string;
                digest: `sha256:${string}`;
            };
            contributor: {
                ref: string;
                digest: `sha256:${string}`;
            };
        }, {
            applicationKind: "node_type";
            catalogRow: {
                ref: string;
                digest: `sha256:${string}`;
            };
            catalogView: {
                ref: string;
                digest: `sha256:${string}`;
            };
            declaration: {
                ref: string;
                digest: `sha256:${string}`;
            };
            target: {
                ref: string;
                digest: `sha256:${string}`;
            } | null;
            applicationBasis: {
                ref: string;
                digest: `sha256:${string}`;
            };
            validationReceipt: {
                ref: string;
                digest: `sha256:${string}`;
            };
            contributor: {
                ref: string;
                digest: `sha256:${string}`;
            };
        }>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
            applicationKind: "node_type";
            application: {
                ref: string;
                digest: `sha256:${string}`;
            };
            target: {
                ref: string;
                digest: `sha256:${string}`;
            } | null;
            evidence: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
            provenance: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
        }, {
            applicationKind: "node_type";
            application: {
                ref: string;
                digest: `sha256:${string}`;
            };
            target: {
                ref: string;
                digest: `sha256:${string}`;
            } | null;
            evidence: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
            provenance: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
        }>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
            code: "unready" | "kind_mismatch" | "view_mismatch" | "target_mismatch" | "application_mismatch" | "callability_mismatch" | "invalid_validation_receipt" | "invalid_contributor";
            issuePaths: string[];
            evidenceRefs: string[];
        }, {
            code: "unready" | "kind_mismatch" | "view_mismatch" | "target_mismatch" | "application_mismatch" | "callability_mismatch" | "invalid_validation_receipt" | "invalid_contributor";
            issuePaths: string[];
            evidenceRefs: string[];
        }>, null>;
        overlay: import("../shared/public_function_contracts.js").OwnerContractSourceDeclaration<{
            readonly operationId: "abg.operation.catalog.apply";
            readonly memberKey: "overlay";
        }, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
            applicationKind: "overlay";
            catalogRow: {
                ref: string;
                digest: `sha256:${string}`;
            };
            catalogView: {
                ref: string;
                digest: `sha256:${string}`;
            };
            declaration: {
                ref: string;
                digest: `sha256:${string}`;
            };
            target: {
                ref: string;
                digest: `sha256:${string}`;
            } | null;
            applicationBasis: {
                ref: string;
                digest: `sha256:${string}`;
            };
            validationReceipt: {
                ref: string;
                digest: `sha256:${string}`;
            };
            contributor: {
                ref: string;
                digest: `sha256:${string}`;
            };
        }, {
            applicationKind: "overlay";
            catalogRow: {
                ref: string;
                digest: `sha256:${string}`;
            };
            catalogView: {
                ref: string;
                digest: `sha256:${string}`;
            };
            declaration: {
                ref: string;
                digest: `sha256:${string}`;
            };
            target: {
                ref: string;
                digest: `sha256:${string}`;
            } | null;
            applicationBasis: {
                ref: string;
                digest: `sha256:${string}`;
            };
            validationReceipt: {
                ref: string;
                digest: `sha256:${string}`;
            };
            contributor: {
                ref: string;
                digest: `sha256:${string}`;
            };
        }>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
            applicationKind: "overlay";
            application: {
                ref: string;
                digest: `sha256:${string}`;
            };
            target: {
                ref: string;
                digest: `sha256:${string}`;
            } | null;
            evidence: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
            provenance: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
        }, {
            applicationKind: "overlay";
            application: {
                ref: string;
                digest: `sha256:${string}`;
            };
            target: {
                ref: string;
                digest: `sha256:${string}`;
            } | null;
            evidence: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
            provenance: {
                ref: string;
                digest: `sha256:${string}`;
            }[];
        }>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
            code: "unready" | "kind_mismatch" | "view_mismatch" | "target_mismatch" | "application_mismatch" | "callability_mismatch" | "invalid_validation_receipt" | "invalid_contributor";
            issuePaths: string[];
            evidenceRefs: string[];
        }, {
            code: "unready" | "kind_mismatch" | "view_mismatch" | "target_mismatch" | "application_mismatch" | "callability_mismatch" | "invalid_validation_receipt" | "invalid_contributor";
            issuePaths: string[];
            evidenceRefs: string[];
        }>, null>;
    }>;
}>;
export interface CatalogOperationPort {
    readonly admit: ExactOwnerOperationPort<typeof admit>;
    readonly constructView: ExactOwnerOperationPort<typeof allowlist>;
    readonly apply: ExactOwnerOperationPort<typeof nodeType | typeof overlay>;
}
export {};
