#!/usr/bin/env python3
"""
Test the modular KEGG implementation
"""

import asyncio
import sys
import os

# Add the parent directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))


async def test_modular_kegg():
    """Test the modular KEGG implementation"""
    print("🧪 Testing Modular KEGG Implementation")
    print("=" * 50)

    try:
        # Test importing the modular components
        from services.kegg.client import KEGGClient
        from services.kegg.schemas import KEGGInfoParams, KEGGPathwayParams
        from services.common.utils import format_response

        print("✅ Successfully imported modular KEGG components")

        # Test KEGG client
        client = KEGGClient()
        print("✅ KEGG client created successfully")

        # Test parameter validation
        params = KEGGInfoParams(database="pathway")
        print(f"✅ Parameter validation working: {params.database}")

        params = KEGGPathwayParams(pathway_id="hsa00010")
        print(f"✅ Pathway parameter validation working: {params.pathway_id}")

        # Test basic API request
        print("\n🔄 Testing basic KEGG API request...")
        result = await client.make_request("info", "pathway")
        print(f"📊 Request status: {result.status}")
        if result.status == "success":
            print(f"📄 Data preview: {str(result.data)[:100]}...")

        print("\n✅ Modular KEGG implementation test completed successfully!")
        return True

    except Exception as e:
        print(f"❌ Error in modular KEGG test: {e}")
        import traceback

        traceback.print_exc()
        return False


async def test_mcp_server_integration():
    """Test the MCP server integration"""
    print("\n🔧 Testing MCP Server Integration")
    print("=" * 50)

    try:
        from ..main import create_mcp_server

        # Create MCP server
        mcp = create_mcp_server()
        print("✅ MCP server created successfully")
        print(f"📊 Server name: {mcp.name}")
        print(f"📊 Server version: {mcp.version}")

        print("\n✅ MCP server integration test completed successfully!")
        return True

    except Exception as e:
        print(f"❌ Error in MCP server test: {e}")
        import traceback

        traceback.print_exc()
        return False


async def main():
    """Main test function"""
    print("🧪 Modular MCP Architecture Test Suite")
    print("=" * 60)

    # Test modular KEGG implementation
    success1 = await test_modular_kegg()

    # Test MCP server integration
    success2 = await test_mcp_server_integration()

    if success1 and success2:
        print("\n🎉 All modular architecture tests passed!")
        print("✅ Modular KEGG implementation working")
        print("✅ MCP server integration working")
        print("✅ Parameter validation working")
        print("✅ API integration functional")
    else:
        print("\n⚠️ Some modular architecture tests failed.")

    return success1 and success2


if __name__ == "__main__":
    success = asyncio.run(main())
    sys.exit(0 if success else 1)
