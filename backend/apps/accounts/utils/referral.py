import random
import string

from ..models import User


def generate_referral_code(length=8):
    """
    Generate a unique referral code.
    """

    while True:

        code = "".join(
            random.choices(
                string.ascii_uppercase + string.digits,
                k=length
            )
        )

        if not User.objects.filter(
            referral_code=code
        ).exists():
            return code