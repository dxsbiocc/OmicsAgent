#!/usr/bin/env python3
"""
Test the optimized base schemas
"""

import asyncio
import sys
import os
from datetime import datetime

# Add the current directory to the path
sys.path.append(os.path.dirname(__file__))


async def test_base_schemas():
    """Test the optimized base schemas"""
    print("🧪 Testing Optimized Base Schemas")
    print("=" * 50)

    try:
        from schemas.base import (
            Status,
            BaseResponse,
            SuccessResponse,
            ErrorResponse,
            create_success_response,
            create_error_response,
            PaginationInfo,
            PaginatedResponse,
            create_paginated_response,
        )
        from schemas.kegg_response import (
            KEGGResponse,
            KEGGSuccessResponse,
            KEGGErrorResponse,
            create_kegg_success_response,
            create_kegg_error_response,
        )

        print("✅ Successfully imported optimized base schemas")

        # Test basic response creation
        print("\n🔄 Testing basic response creation...")

        # Test success response
        success_resp = create_success_response(data={"message": "Hello World"})
        print(f"✅ Success response: {success_resp.status} - {success_resp.data}")

        # Test error response
        error_resp = create_error_response(
            error="Something went wrong", error_code="E001"
        )
        print(f"✅ Error response: {error_resp.status} - {error_resp.error}")

        # Test KEGG-specific responses
        print("\n🔄 Testing KEGG-specific responses...")

        kegg_success = create_kegg_success_response(
            data={"pathway": "hsa00010", "name": "Glycolysis"},
            url="https://rest.kegg.jp/get/hsa00010",
            operation="get",
            argument="hsa00010",
            content_type="application/json",
        )
        print(f"✅ KEGG success: {kegg_success.status} - {kegg_success.operation}")

        kegg_error = create_kegg_error_response(
            error="Pathway not found",
            url="https://rest.kegg.jp/get/invalid",
            operation="get",
            argument="invalid",
            error_code="PATHWAY_NOT_FOUND",
        )
        print(f"✅ KEGG error: {kegg_error.status} - {kegg_error.error}")

        # Test pagination
        print("\n🔄 Testing pagination...")

        pagination = PaginationInfo(
            page=1, per_page=10, total=100, pages=10, has_next=True, has_prev=False
        )

        paginated_resp = create_paginated_response(
            data=[{"id": i, "name": f"Item {i}"} for i in range(1, 11)],
            pagination=pagination,
        )
        print(f"✅ Paginated response: {paginated_resp.pagination.total} items")

        print("\n✅ Optimized base schemas test completed successfully!")
        return True

    except Exception as e:
        print(f"❌ Error in base schemas test: {e}")
        import traceback

        traceback.print_exc()
        return False


async def test_kegg_client_integration():
    """Test KEGG client with optimized schemas"""
    print("\n🔧 Testing KEGG Client Integration")
    print("=" * 50)

    try:
        from services.kegg.client import KEGGClient

        client = KEGGClient()
        print("✅ KEGG client created successfully")

        # Test basic API request
        print("\n🔄 Testing basic KEGG API request...")
        result = await client.make_request("info", "pathway")
        print(f"📊 Request status: {result.status}")
        print(f"📊 Operation: {result.operation}")
        print(f"📊 Argument: {result.argument}")
        if result.status == "success":
            print(f"📄 Data preview: {str(result.data)[:100]}...")

        print("\n✅ KEGG client integration test completed successfully!")
        return True

    except Exception as e:
        print(f"❌ Error in KEGG client test: {e}")
        import traceback

        traceback.print_exc()
        return False


async def main():
    """Main test function"""
    print("🧪 Optimized Base Schemas Test Suite")
    print("=" * 60)

    # Test optimized base schemas
    success1 = await test_base_schemas()

    # Test KEGG client integration
    success2 = await test_kegg_client_integration()

    if success1 and success2:
        print("\n🎉 All optimized base schema tests passed!")
        print("✅ Generic base schemas working")
        print("✅ KEGG-specific schemas working")
        print("✅ Response creation functions working")
        print("✅ Pagination working")
        print("✅ KEGG client integration working")
    else:
        print("\n⚠️ Some optimized base schema tests failed.")

    return success1 and success2


if __name__ == "__main__":
    success = asyncio.run(main())
    sys.exit(0 if success else 1)
